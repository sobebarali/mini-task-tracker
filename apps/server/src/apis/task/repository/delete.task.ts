import { redis, Task } from "@mini-task-tracker/db";
import type { typeResult } from "../types/delete.task";

// Helper to invalidate user cache
const invalidateCache = async (userId: string): Promise<void> => {
	const pattern = `tasks:${userId}*`;
	const keys = await redis.keys(pattern);
	if (keys.length > 0) {
		await redis.del(...keys);
	}
};

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
