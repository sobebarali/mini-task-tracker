import { Task } from "@mini-task-tracker/db";
import { invalidateCache } from "../helpers/cache-invalidator";
import { taskToPlain } from "../helpers/task-transformer";
import type { typeResult } from "../types/create.task";

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
