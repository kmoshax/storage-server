import { Logger } from "./logger";

export const env = (key: string, defaultValue?: string): string => {
    const value = process.env[key];

    if (!value) throw Logger.error(`Missing required environment variable: ${key}`);

    if (key === 'API_KEY' && value === "your-super-secret-api-key") 
        Logger.warn('Default API_KEY is used. Please generate a secure key for production!');

    return value;
};