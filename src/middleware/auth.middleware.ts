import { config } from '../config';
import { ApiError } from '../lib/errors';

export function authenticateRequest(request: Request): void {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey || apiKey !== config.apiKey) {
        throw new ApiError(401, 'Unauthorized: Invalid API Key');
    }
}