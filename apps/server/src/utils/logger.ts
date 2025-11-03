import winston from "winston";

// Define log levels
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

// Define colors for each level
const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
	const env = process.env.NODE_ENV || "development";
	const isDevelopment = env === "development";
	const isTest = env === "test";
	return isTest ? "error" : isDevelopment ? "debug" : "info";
};

// Define format for logs
const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.errors({ stack: true }),
	winston.format.json(),
);

// Define format for console (development)
const consoleFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.colorize({ all: true }),
	winston.format.printf((info) => {
		const { timestamp, level, message, ...meta } = info;
		const metaStr = Object.keys(meta).length
			? JSON.stringify(meta, null, 2)
			: "";
		return `${timestamp} [${level}]: ${message} ${metaStr}`;
	}),
);

// Define transports
const transports = [
	// Console transport for all environments except test
	...(process.env.NODE_ENV !== "test"
		? [
				new winston.transports.Console({
					format: process.env.NODE_ENV === "production" ? format : consoleFormat,
				}),
			]
		: []),
	// File transport for errors
	new winston.transports.File({
		filename: "logs/error.log",
		level: "error",
		format,
	}),
	// File transport for all logs
	new winston.transports.File({
		filename: "logs/combined.log",
		format,
	}),
];

// Create logger instance
const logger = winston.createLogger({
	level: level(),
	levels,
	format,
	transports,
	// Don't exit on uncaught exceptions
	exitOnError: false,
});

// Helper methods for structured logging
export const logInfo = (message: string, meta?: Record<string, unknown>) => {
	logger.info(message, meta);
};

export const logError = (
	message: string,
	error?: Error | unknown,
	meta?: Record<string, unknown>,
) => {
	logger.error(message, {
		...meta,
		error: error instanceof Error ? error.message : String(error),
		stack: error instanceof Error ? error.stack : undefined,
	});
};

export const logWarn = (message: string, meta?: Record<string, unknown>) => {
	logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, unknown>) => {
	logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: Record<string, unknown>) => {
	logger.http(message, meta);
};

// Request-specific logger
export const createRequestLogger = (requestId: string) => {
	return {
		info: (message: string, meta?: Record<string, unknown>) => {
			logInfo(message, { requestId, ...meta });
		},
		error: (
			message: string,
			error?: Error | unknown,
			meta?: Record<string, unknown>,
		) => {
			logError(message, error, { requestId, ...meta });
		},
		warn: (message: string, meta?: Record<string, unknown>) => {
			logWarn(message, { requestId, ...meta });
		},
		debug: (message: string, meta?: Record<string, unknown>) => {
			logDebug(message, { requestId, ...meta });
		},
	};
};

export default logger;
