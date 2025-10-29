import { EOL } from 'node:os';

const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
};

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';

export class Logger {
	private static log(level: LogLevel, message: string, ...args: any[]) {
		const timestamp = new Date().toISOString();
		let levelColor: string;
		let emoji: string;

		switch (level) {
			case 'INFO':
				levelColor = colors.cyan;
				emoji = 'ℹ️';
				break;
			case 'WARN':
				levelColor = colors.yellow;
				emoji = '⚠️';
				break;
			case 'ERROR':
				levelColor = colors.red;
				emoji = '❌';
				break;
			case 'DEBUG':
				levelColor = colors.magenta;
				emoji = '🐞';
				break;
			case 'SUCCESS':
				levelColor = colors.green;
				emoji = '✅';
				break;
		}

		const formattedMessage = `${timestamp} ${emoji} [${levelColor}${level}${colors.reset}] - ${message}`;

		console.log(formattedMessage);

		if (args.length > 0) {
			console.log(...args);
		}
	}

	static info(message: string, ...args: any[]) {
		Logger.log('INFO', message, ...args);
	}

	static warn(message: string, ...args: any[]) {
		Logger.log('WARN', message, ...args);
	}

	static error(error: string | Error, ...args: any[]) {
		const message =
			error instanceof Error ? `${error.message}${EOL}${error.stack}` : error;
		Logger.log('ERROR', message, ...args);
	}

	static debug(message: string, ...args: any[]) {
		Logger.log('DEBUG', message, ...args);
	}

	static success(message: string, ...args: any[]) {
		Logger.log('SUCCESS', message, ...args);
	}
}
