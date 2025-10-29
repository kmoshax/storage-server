import { env, parseMimeTypes } from './libs/utils';

export const config = {
	port: parseInt(env('PORT', '2007'), 10),
	apiKey: env('API_KEY'),
	uploadDir: env('UPLOAD_DIR', 'uploads'),
	maxFileSize: parseInt(env('MAX_FILE_SIZE_MB', '100'), 10) * 1024 * 1024,
	allowedMimeTypes: parseMimeTypes(env('ALLOWED_MIME_TYPES', '')),
};
