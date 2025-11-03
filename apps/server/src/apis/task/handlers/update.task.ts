import { createRequestLogger } from "../../../utils/logger";
import update from "../repository/update.task";
import type { typeResult } from "../types/update.task";

export default async function updateTasksHandler({
	taskId,
	title,
	description,
	status,
	dueDate,
	userId,
	requestId,
}: {
	taskId: string;
	title?: string;
	description?: string;
	status?: string;
	dueDate?: string;
	userId: string;
	requestId: string;
}): Promise<typeResult> {
	const logger = createRequestLogger(requestId);

	try {
		logger.info("Update task handler started", {
			taskId,
			userId,
			updateFields: { title, description, status, dueDate },
		});

		// Call repository
		const result = await update({
			taskId,
			title,
			description,
			status,
			dueDate,
			userId,
		});

		if (result.data) {
			logger.info("Update task handler completed", {
				taskId,
				userId,
				updatedFields: { title, description, status, dueDate },
			});
		} else {
			logger.warn("Update task failed", {
				taskId,
				userId,
				reason: result.error?.code || "UNKNOWN",
			});
		}

		return result;
	} catch (error) {
		const err = error as Error;
		logger.error("Update task handler error", err, {
			taskId,
			userId,
			updateFields: { title, description, status, dueDate },
		});

		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to update task",
				statusCode: 500,
				requestId,
			},
		};
	}
}
