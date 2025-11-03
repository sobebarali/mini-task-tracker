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
	try {
		console.log(`[${requestId}] Delete task handler started`);

		// Call repository
		const result = await remove({ taskId, userId });

		console.log(`[${requestId}] Delete task handler completed`);
		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Delete task handler error:`, err.message);

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
