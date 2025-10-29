import { uptime, totalmem, freemem } from 'node:os';
import { prisma } from './prisma';
import { Logger } from './logger';

export const env = (key: string, defaultValue?: string): string => {
	const value = process.env[key] || defaultValue;

	if (!value)
		throw Logger.error(`Missing required environment variable: ${key}`);

	if (key === 'API_KEY' && value === 'your-super-secret-api-key')
		Logger.warn(
			'Default API_KEY is used. Please generate a secure key for production!',
		);

	return value;
};

export const parseMimeTypes = (value: string): string[] => {
	if (!value) return [];
	return value
		.split(',')
		.map((type) => type.trim())
		.filter(Boolean);
};

export const getHealthStatus = async () => {
	let dbStatus: 'ok' | 'error' = 'ok';
	try {
		await prisma.$queryRaw`SELECT 1`;
	} catch (e) {
		dbStatus = 'error';
		Logger.error('Health check failed to connect to the database.', e);
	}

	const memoryUsage = process.memoryUsage();

	return {
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: uptime(),
		database: dbStatus,
		memory: {
			rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
			heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
			heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
			external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
			systemTotal: `${(totalmem() / 1024 / 1024).toFixed(2)} MB`,
			systemFree: `${(freemem() / 1024 / 1024).toFixed(2)} MB`,
		},
	};
};
