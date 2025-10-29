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
		'/': () => new Response('Welcome to Bun Storage Server ⚡️'),

		'/health': async () => Response.json(await getHealthStatus()),

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
		Logger.warn(`404 Not Found for: ${req.method} ${url.pathname}`);
		return Response.json(
			{ error: 'Not Found', path: url.pathname },
			{ status: 404 },
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
				{ status: 500, headers: { 'Content-Type': 'application/json' } },
			);
		}

		return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	},
});

Logger.success(`🚀 Server running at http://${server.hostname}:${server.port}`);
