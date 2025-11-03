import { type ITask, redis, Task, TaskStatus } from "@mini-task-tracker/db";
import type { typeResult } from "../types/update.task";

// Helper to convert Mongoose document to plain object
const taskToPlain = (task: ITask) => ({
	id: String(task._id),
	title: task.title,
	description: task.description,
	status: task.status,
	dueDate: task.dueDate?.toISOString(),
	owner: String(task.owner),
	createdAt: task.createdAt.toISOString(),
});

// Helper to invalidate user cache
const invalidateCache = async (userId: string): Promise<void> => {
	const pattern = `tasks:${userId}*`;
	const keys = await redis.keys(pattern);
	if (keys.length > 0) {
		await redis.del(...keys);
	}
};

export default async function update({
	taskId,
	title,
	description,
	status,
	dueDate,
	userId,
}: {
	taskId: string;
	title?: string;
	description?: string;
	status?: string;
	dueDate?: string;
	userId: string;
}): Promise<typeResult> {
	try {
		const task = await Task.findOne({ _id: taskId, owner: userId });

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

		// Update fields
		if (title !== undefined) task.title = title;
		if (description !== undefined) task.description = description;
		if (status !== undefined) {
			// Validate status is a valid TaskStatus
			if (status === TaskStatus.PENDING || status === TaskStatus.COMPLETED) {
				task.status = status;
			}
		}
		if (dueDate !== undefined) task.dueDate = new Date(dueDate);

		await task.save();

		// Invalidate cache
		await invalidateCache(userId);

		return {
			data: taskToPlain(task),
			error: null,
		};
	} catch (error) {
		throw new Error(
			`Database error: Failed to update task: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
