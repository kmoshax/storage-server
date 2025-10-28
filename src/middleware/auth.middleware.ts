import { config } from '../config';
import { UnauthorizedError } from '../libs/errors';

export function verifyApiKey(req: Request): void {
    const providedKey = req.headers.get('x-api-key');
    
    if (!providedKey || providedKey !== config.apiKey) {
        throw new UnauthorizedError('Invalid or missing API Key');
    }
}