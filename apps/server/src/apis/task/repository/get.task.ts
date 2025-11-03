import { type ITask, Task } from "@mini-task-tracker/db";
import type { typeResult } from "../types/get.task";

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

export default async function get({
	taskId,
	userId,
}: {
	taskId: string;
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

		return {
			data: taskToPlain(task),
			error: null,
		};
	} catch (error) {
		throw new Error(
			`Database error: Failed to get task: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
