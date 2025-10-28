import { config } from '../config';
import { ApiError } from '../lib/api-error';

export function authenticateRequest(request: Request): void {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey || apiKey !== config.apiKey) {
        throw new ApiError(401, 'Unauthorized: Invalid API Key');
    }
}