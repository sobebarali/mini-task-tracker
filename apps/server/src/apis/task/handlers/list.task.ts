import { createRequestLogger } from "../../../utils/logger";
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
	const logger = createRequestLogger(requestId);

	try {
		logger.info("List tasks handler started", {
			userId,
			filters: { status, dueDate },
		});

		// Call repository
		const result = await list({
			status,
			dueDate,
			userId,
		});

		if (result.data) {
			logger.info("List tasks handler completed", {
				userId,
				total: result.data.total,
				filters: { status, dueDate },
			});
		}

		return result;
	} catch (error) {
		const err = error as Error;
		logger.error("List tasks handler error", err, {
			userId,
			filters: { status, dueDate },
		});

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
