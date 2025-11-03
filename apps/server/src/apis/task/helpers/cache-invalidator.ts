import { redis } from "@mini-task-tracker/db";

/**
 * Helper to invalidate user cache
 */
export const invalidateCache = async (userId: string): Promise<void> => {
	const pattern = `tasks:${userId}*`;
	const keys = await redis.keys(pattern);
	if (keys.length > 0) {
		await redis.del(...keys);
	}
};
