import { type ITask, redis, Task } from "@mini-task-tracker/db";
import type { typeResult } from "../types/create.task";

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

export default async function create({
	title,
	description,
	status,
	dueDate,
	userId,
}: {
	title: string;
	description?: string;
	status?: string;
	dueDate?: string;
	userId: string;
}): Promise<typeResult> {
	try {
		const task = await Task.create({
			title,
			description,
			status,
			owner: userId,
			dueDate: dueDate ? new Date(dueDate) : undefined,
		});

		// Invalidate cache
		await invalidateCache(userId);

		return {
			data: taskToPlain(task),
			error: null,
		};
	} catch (error) {
		throw new Error(
			`Database error: Failed to create task: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
