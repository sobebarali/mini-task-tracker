import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { loginAuth as loginAuthService } from "../services/login.auth";
import { validatePayload } from "../validators/login.auth";

export const loginAuth = async (req: Request, res: Response): Promise<void> => {
	const requestId = randomBytes(16).toString("hex");

	try {
		// Validate request payload
		const validation = validatePayload(req.body);
		if (!validation.success) {
			res.status(400).json({
				data: null,
				error: {
					code: "VALIDATION_ERROR",
					message: validation.error.message,
					statusCode: 400,
					requestId,
				},
			});
			return;
		}

		// Call service layer with requestId
		const result = await loginAuthService({ ...validation.data, requestId });

		// Return service result
		const statusCode = result.error ? result.error.statusCode || 500 : 200;
		res.status(statusCode).json(result);
	} catch (_error) {
		res.status(500).json({
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: "Failed to process request",
				statusCode: 500,
				requestId,
			},
		});
	}
};
