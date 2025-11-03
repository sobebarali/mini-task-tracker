import { type ITask, redis, Task } from "@mini-task-tracker/db";
import type {
	typeCreatePayload,
	typeCreateResult,
	typeDeleteResult,
	typeGetTasksFilters,
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

// Helper to generate cache key with filters
const generateCacheKey = (
	userId: string,
	filters: typeGetTasksFilters = {},
): string => {
	// For backward compatibility, if no filters, use the old format
	if (Object.keys(filters).length === 0) {
		return `${CACHE_KEY_PREFIX}${userId}`;
	}

	const filterString = Object.keys(filters)
		.sort()
		.map((key) => `${key}:${filters[key as keyof typeGetTasksFilters]}`)
		.join("|");
	return `${CACHE_KEY_PREFIX}${userId}:${filterString}`;
};

// Helper to invalidate cache for a user (all filter combinations)
const invalidateCache = async (userId: string): Promise<void> => {
	// Delete the old format key (no filters)
	await redis.del(`${CACHE_KEY_PREFIX}${userId}`);

	// Get all keys matching the new pattern for this user
	const pattern = `${CACHE_KEY_PREFIX}${userId}:*`;
	const keys = await redis.keys(pattern);
	if (keys.length > 0) {
		await redis.del(...keys);
	}
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

// Get Tasks (with Redis caching and filtering)
export const getTasks = async (
	userId: string,
	filters: typeGetTasksFilters = {},
): Promise<typeGetTasksResult> => {
	try {
		const cacheKey = generateCacheKey(userId, filters);

		// Try to get from cache
		const cachedData = await redis.get(cacheKey);
		if (cachedData) {
			console.log(`Cache hit for user ${userId} with filters:`, filters);
			return JSON.parse(cachedData);
		}

		console.log(`Cache miss for user ${userId} with filters:`, filters);

		// Build query
		const query: Record<string, unknown> = { owner: userId };

		if (filters.status) {
			query.status = filters.status;
		}

		if (filters.dueDate) {
			// Filter tasks due on or before the specified date
			const dueDate = new Date(filters.dueDate);
			query.dueDate = { $lte: dueDate };
		}

		// Get from database
		const tasks = await Task.find(query).sort({ createdAt: -1 });

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
