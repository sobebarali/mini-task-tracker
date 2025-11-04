import { Task } from "@mini-task-tracker/db";
import { invalidateCache } from "../helpers/cache-invalidator";
import type { typeResult } from "../types/delete.task";

export default async function remove({
	taskId,
	userId,
}: {
	taskId: string;
	userId: string;
}): Promise<typeResult> {
	try {
		const task = await Task.findOneAndDelete({ _id: taskId, owner: userId });

		if (!task) {
			return {
				data: null,
				error: {
					code: "NOT_FOUND",
					message: "Task not found",
					statusCode: 404,
					requestId: "",
				},
			};
		}

		// Invalidate cache
		await invalidateCache(userId);

		return {
			data: {
				message: "Task deleted successfully",
			},
			error: null,
		};
	} catch (error) {
		throw new Error(
			`Database error: Failed to delete task: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
