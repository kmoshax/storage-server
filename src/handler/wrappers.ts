import { ApiError } from '../libs/errors';
import { Logger } from '../libs/logger';
import { verifyApiKey } from '../middleware/auth.middleware';

type ControllerAction = (req: Request) => Promise<Response> | Response;

function addCorsHeaders(response: Response): Response {
	const headers = new Headers(response.headers);
	headers.set('Access-Control-Allow-Origin', '*');
	headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

function handleErrors(action: ControllerAction): ControllerAction {
	return async (req: Request) => {
		try {
			const response = await action(req);
			return addCorsHeaders(response);
		} catch (error) {
			if (error instanceof ApiError) {
				Logger.warn(
					`API Error: ${error.statusCode} - ${error.message} for ${req.method} ${req.url}`,
				);
				const response = Response.json(
					{ error: error.message },
					{ status: error.statusCode },
				);
				return addCorsHeaders(response);
			}

			Logger.error(error as Error);
			const response = Response.json({ error: 'Internal Server Error' }, { status: 500 });
			return addCorsHeaders(response);
		}
	};
}

export function withAuth(action: ControllerAction): ControllerAction {
	const handledAction = handleErrors(async (req: Request) => {
		verifyApiKey(req);

		return await action(req);
	});

	return handledAction;
}

export function withErrorHandling(action: ControllerAction): ControllerAction {
	return handleErrors(action);
}
