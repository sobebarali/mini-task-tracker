import { createRequestLogger } from "../../../utils/logger";
import get from "../repository/get.task";
import type { typeResult } from "../types/get.task";

export default async function getTasksHandler({
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
		logger.info("Get task handler started", { taskId, userId });

		// Call repository
		const result = await get({ taskId, userId });

		if (result.data) {
			logger.info("Get task handler completed", {
				taskId,
				userId,
				taskFound: true,
			});
		} else {
			logger.warn("Task not found", { taskId, userId });
		}

		return result;
	} catch (error) {
		const err = error as Error;
		logger.error("Get task handler error", err, { taskId, userId });

		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to get task",
				statusCode: 500,
				requestId,
			},
		};
	}
}
