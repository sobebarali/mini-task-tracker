import { redis, Task } from "@mini-task-tracker/db";
import { logDebug, logInfo } from "../../../utils/logger";
import { taskToPlain } from "../helpers/task-transformer";
import type { typeResult } from "../types/list.task";

const CACHE_TTL = 300; // 5 minutes
const CACHE_KEY_PREFIX = "tasks:";

// Helper to generate cache key with filters
const generateCacheKey = (
	userId: string,
	filters: { status?: string; dueDate?: string } = {},
): string => {
	if (Object.keys(filters).length === 0) {
		return `${CACHE_KEY_PREFIX}${userId}`;
	}

	const filterString = Object.keys(filters)
		.sort()
		.map((key) => `${key}:${filters[key as keyof typeof filters]}`)
		.join("|");
	return `${CACHE_KEY_PREFIX}${userId}:${filterString}`;
};

export default async function list({
	status,
	dueDate,
	userId,
}: {
	status?: string;
	dueDate?: string;
	userId: string;
}): Promise<typeResult> {
	try {
		const cacheKey = generateCacheKey(userId, { status, dueDate });

		// Try to get from cache
		const cachedData = await redis.get(cacheKey);
		if (cachedData) {
			logDebug("Cache hit for list tasks", {
				userId,
				cacheKey,
				filters: { status, dueDate },
			});
			return JSON.parse(cachedData);
		}

		logDebug("Cache miss for list tasks", {
			userId,
			cacheKey,
			filters: { status, dueDate },
		});

		// Build query
		const query: Record<string, unknown> = { owner: userId };

		if (status) {
			query.status = status;
		}

		if (dueDate) {
			// Filter tasks due on or before the specified date
			const dueDateObj = new Date(dueDate);
			query.dueDate = { $lte: dueDateObj };
		}

		// Get from database
		const tasks = await Task.find(query).sort({ createdAt: -1 });

		logInfo("Tasks fetched from database", {
			userId,
			count: tasks.length,
			filters: { status, dueDate },
		});

		const result: typeResult = {
			data: {
				tasks: tasks.map(taskToPlain),
				total: tasks.length,
			},
			error: null,
		};

		// Cache the result
		await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
		logDebug("Tasks cached", { userId, cacheKey, ttl: CACHE_TTL });

		return result;
	} catch (error) {
		throw new Error(
			`Database error: Failed to list tasks: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
