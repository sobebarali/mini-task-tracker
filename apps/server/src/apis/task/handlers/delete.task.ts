import { createRequestLogger } from "../../../utils/logger";
import remove from "../repository/delete.task";
import type { typeResult } from "../types/delete.task";

export default async function deleteTasksHandler({
	taskId,
	userId,
	requestId,
}: {
	taskId: string;
	userId: string;
	requestId: string;
}): Promise<typeResult> {
	const logger = createRequestLogger(requestId);

	try {
		logger.info("Delete task handler started", { taskId, userId });

		// Call repository
		const result = await remove({ taskId, userId });

		if (result.data) {
			logger.info("Delete task handler completed", { taskId, userId });
		} else {
			logger.warn("Delete task failed", {
				taskId,
				userId,
				reason: result.error?.code || "UNKNOWN",
			});
		}

		return result;
	} catch (error) {
		const err = error as Error;
		logger.error("Delete task handler error", err, { taskId, userId });

		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to delete task",
				statusCode: 500,
				requestId,
			},
		};
	}
}
