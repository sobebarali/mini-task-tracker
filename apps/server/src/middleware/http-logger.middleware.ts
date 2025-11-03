import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { logHttp } from "../utils/logger";

// Extend Express Request to include requestId
declare global {
	namespace Express {
		interface Request {
			requestId?: string;
		}
	}
}

/**
 * HTTP request logging middleware
 * Logs all incoming requests with method, URL, and response details
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
	// Generate unique request ID
	const requestId = randomBytes(16).toString("hex");
	req.requestId = requestId;

	// Log incoming request
	const startTime = Date.now();

	logHttp("Incoming request", {
		requestId,
		method: req.method,
		url: req.url,
		ip: req.ip,
		userAgent: req.get("user-agent"),
	});

	// Log response when finished
	res.on("finish", () => {
		const duration = Date.now() - startTime;
		logHttp("Request completed", {
			requestId,
			method: req.method,
			url: req.url,
			statusCode: res.statusCode,
			duration: `${duration}ms`,
		});
	});

	next();
};
