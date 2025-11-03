import { randomBytes } from "node:crypto";
import type { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth.middleware";
import createTasksHandler from "../handlers/create.task";
import { validatePayload } from "../validators/create.task";

export default async function createTasksController(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	const requestId = randomBytes(16).toString("hex");

	try {
		// Check authentication
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({
				data: null,
				error: {
					code: "UNAUTHORIZED",
					message: "User not authenticated",
					statusCode: 401,
					requestId,
				},
			});
			return;
		}

		// Validate input
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

		// Call handler
		const result = await createTasksHandler({
			...validation.data,
			userId,
			requestId,
		});

		const statusCode = result.error ? result.error.statusCode : 201;
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
}
