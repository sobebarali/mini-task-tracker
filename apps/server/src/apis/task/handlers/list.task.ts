import list from "../repository/list.task";
import type { typeResult } from "../types/list.task";

export default async function listTasksHandler({
	status,
	dueDate,
	userId,
	requestId,
}: {
	status?: string;
	dueDate?: string;
	userId: string;
	requestId: string;
}): Promise<typeResult> {
	try {
		console.log(`[${requestId}] List tasks handler started with filters:`, {
			status,
			dueDate,
		});

		// Call repository
		const result = await list({
			status,
			dueDate,
			userId,
		});

		console.log(`[${requestId}] List tasks handler completed`);
		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] List tasks handler error:`, err.message);

		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to list tasks",
				statusCode: 500,
				requestId,
			},
		};
	}
}
