import type { ITask } from "@mini-task-tracker/db";

/**
 * Helper to convert Mongoose document to plain object
 */
export const taskToPlain = (task: ITask) => ({
	id: String(task._id),
	title: task.title,
	description: task.description,
	status: task.status,
	dueDate: task.dueDate?.toISOString(),
	owner: String(task.owner),
	createdAt: task.createdAt.toISOString(),
});
