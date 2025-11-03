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
	try {
		console.log(`[${requestId}] Get task handler started`);

		// Call repository
		const result = await get({ taskId, userId });

		console.log(`[${requestId}] Get task handler completed`);
		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Get task handler error:`, err.message);

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
