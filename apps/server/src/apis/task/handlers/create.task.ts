import create from "../repository/create.task";
import type { typeResult } from "../types/create.task";

export default async function createTasksHandler({
	title,
	description,
	status,
	dueDate,
	userId,
	requestId,
}: {
	title: string;
	description?: string;
	status?: string;
	dueDate?: string;
	userId: string;
	requestId: string;
}): Promise<typeResult> {
	try {
		console.log(`[${requestId}] Create task handler started`);

		// Call repository
		const result = await create({
			title,
			description,
			status,
			dueDate,
			userId,
		});

		console.log(`[${requestId}] Create task handler completed`);
		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Create task handler error:`, err.message);

		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to create task",
				statusCode: 500,
				requestId,
			},
		};
	}
}
