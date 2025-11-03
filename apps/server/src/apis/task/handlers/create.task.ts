import { createRequestLogger } from "../../../utils/logger";
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
	const logger = createRequestLogger(requestId);

	try {
		logger.info("Create task handler started", {
			userId,
			payload: { title, description, status, dueDate },
		});

		// Call repository
		const result = await create({
			title,
			description,
			status,
			dueDate,
			userId,
		});

		if (result.data) {
			logger.info("Create task handler completed", {
				userId,
				taskId: result.data.id,
				title,
			});
		}

		return result;
	} catch (error) {
		const err = error as Error;
		logger.error("Create task handler error", err, {
			userId,
			payload: { title, description, status, dueDate },
		});

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
