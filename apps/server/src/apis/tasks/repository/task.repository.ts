import { type ITask, redis, Task } from "@mini-task-tracker/db";
import type {
	typeCreatePayload,
	typeCreateResult,
	typeDeleteResult,
	typeGetTasksResult,
	typeTaskData,
	typeUpdatePayload,
	typeUpdateResult,
} from "../types/task.types";

const CACHE_TTL = 300; // 5 minutes in seconds
const CACHE_KEY_PREFIX = "tasks:";

// Helper to convert Mongoose document to plain object
const taskToPlain = (task: ITask): typeTaskData => ({
	id: String(task._id),
	title: task.title,
	description: task.description,
	status: task.status,
	dueDate: task.dueDate?.toISOString(),
	owner: String(task.owner),
	createdAt: task.createdAt.toISOString(),
});

// Helper to invalidate cache for a user
const invalidateCache = async (userId: string): Promise<void> => {
	const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;
	await redis.del(cacheKey);
};

// Create Task
export const createTask = async (
	payload: typeCreatePayload,
	userId: string,
): Promise<typeCreateResult> => {
	try {
		const task = await Task.create({
			...payload,
			owner: userId,
			dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
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
};

// Get Tasks (with Redis caching)
export const getTasks = async (userId: string): Promise<typeGetTasksResult> => {
	try {
		const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;

		// Try to get from cache
		const cachedData = await redis.get(cacheKey);
		if (cachedData) {
			console.log(`Cache hit for user ${userId}`);
			return JSON.parse(cachedData);
		}

		console.log(`Cache miss for user ${userId}`);

		// Get from database
		const tasks = await Task.find({ owner: userId }).sort({ createdAt: -1 });

		const result: typeGetTasksResult = {
			data: {
				tasks: tasks.map(taskToPlain),
				total: tasks.length,
			},
			error: null,
		};

		// Cache the result
		await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

		return result;
	} catch (error) {
		throw new Error(
			`Database error: Failed to get tasks: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
};

// Update Task
export const updateTask = async (
	taskId: string,
	payload: typeUpdatePayload,
	userId: string,
): Promise<typeUpdateResult> => {
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
		if (payload.title !== undefined) task.title = payload.title;
		if (payload.description !== undefined)
			task.description = payload.description;
		if (payload.status !== undefined) task.status = payload.status;
		if (payload.dueDate !== undefined) task.dueDate = new Date(payload.dueDate);

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
};

// Delete Task
export const deleteTask = async (
	taskId: string,
	userId: string,
): Promise<typeDeleteResult> => {
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
};
