import { existsSync, mkdirSync } from 'node:fs';

import { config } from './config';
import { FileController } from './controllers/file.controller';
import { withAuth, withErrorHandling } from './handler/wrappers';
import { Logger } from './libs/logger';
import { getHealthStatus } from './libs/utils';

if (!existsSync(config.uploadDir)) {
	mkdirSync(config.uploadDir, { recursive: true });
	Logger.info(`Created uploads directory at: ${config.uploadDir}`);
}

const server = Bun.serve({
	idleTimeout: 10,
	development: true,
	port: process.env.APP_PORT || 2007,

	routes: {
		'/': () => new Response('Welcome to Bun Storage Server ⚡️', {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
			},
		}),

		'/health': async () => new Response(JSON.stringify(await getHealthStatus()), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
			},
		}),

		'/files/upload': {
			POST: withAuth(FileController.uploadFile),
		},

		'/files/:filename': {
			GET: withErrorHandling(FileController.getFile),

			DELETE: withAuth(FileController.deleteFile),
		},
	},

	fetch(req) {
		const url = new URL(req.url);

		// Handle CORS preflight requests
		if (req.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		Logger.warn(`404 Not Found for: ${req.method} ${url.pathname}`);
		return Response.json(
			{ error: 'Not Found', path: url.pathname },
			{
				status: 404,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
				},
			},
		);
	},

	error(error: Error) {
		Logger.error('A critical, unhandled server error occurred', error);

		if (process.env.NODE_ENV !== 'production') {
			return new Response(
				JSON.stringify({
					error: 'Internal Server Error',
					message: error.message,
					stack: error.stack,
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
					},
				},
			);
		}

		return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
			},
		});
	},
});

Logger.success(`🚀 Server running at http://${server.hostname}:${server.port}`);

export default server;
