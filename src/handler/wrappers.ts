import { ApiError } from '../libs/errors';
import { Logger } from '../libs/logger';
import { verifyApiKey } from '../middleware/auth.middleware';

type ControllerAction = (req: Request) => Promise<Response> | Response;

function handleErrors(action: ControllerAction): ControllerAction {
	return async (req: Request) => {
		try {
			return await action(req);
		} catch (error) {
			if (error instanceof ApiError) {
				Logger.warn(
					`API Error: ${error.statusCode} - ${error.message} for ${req.method} ${req.url}`,
				);
				return Response.json(
					{ error: error.message },
					{ status: error.statusCode },
				);
			}

			Logger.error(error as Error);
			return Response.json({ error: 'Internal Server Error' }, { status: 500 });
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
