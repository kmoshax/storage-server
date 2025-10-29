import { env } from './libs/utils';

export const config = {
	port: parseInt(env('PORT', '2007'), 10),
	apiKey: env('API_KEY'),
	uploadDir: env('UPLOAD_DIR'),
	maxFileSize: parseInt(env('MAX_FILE_SIZE_MB'), 10) * 1024 * 1024,
	allowedMimeTypes: env('ALLOWED_MIME_TYPES').split(','),
};
