import { Task, TaskStatus } from "@mini-task-tracker/db";
import { taskToPlain } from "../helpers/task-transformer";
import { invalidateCache } from "../helpers/cache-invalidator";
import type { typeResult } from "../types/update.task";

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
