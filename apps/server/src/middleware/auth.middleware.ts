import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
	throw new Error("JWT_SECRET must be set in environment variables");
}

export interface AuthRequest extends Request {
	user?: {
		userId: string;
		email: string;
	};
}

export const authMiddleware = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): void => {
	try {
		// Get token from Authorization header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({
				data: null,
				error: {
					code: "UNAUTHORIZED",
					message: "No token provided",
					statusCode: 401,
				},
			});
			return;
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix

		// Verify token
		const decoded = jwt.verify(token, JWT_SECRET) as {
			userId: string;
			email: string;
		};

		// Attach user info to request
		req.user = decoded;

		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({
				data: null,
				error: {
					code: "UNAUTHORIZED",
					message: "Invalid token",
					statusCode: 401,
				},
			});
			return;
		}

		res.status(500).json({
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: "Failed to authenticate",
				statusCode: 500,
			},
		});
	}
};
