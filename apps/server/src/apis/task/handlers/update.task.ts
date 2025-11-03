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
	try {
		console.log(`[${requestId}] Update task handler started`);

		// Call repository
		const result = await update({
			taskId,
			title,
			description,
			status,
			dueDate,
			userId,
		});

		console.log(`[${requestId}] Update task handler completed`);
		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Update task handler error:`, err.message);

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
