import { randomBytes } from "node:crypto";
import type { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth.middleware";
import updateTasksHandler from "../handlers/update.task";
import { validatePayload } from "../validators/update.task";

export default async function updateTasksController(
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
		const validation = validatePayload({ taskId: req.params.id, ...req.body });
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
		const result = await updateTasksHandler({
			...validation.data,
			userId,
			requestId,
		});

		const statusCode = result.error ? result.error.statusCode : 200;
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
