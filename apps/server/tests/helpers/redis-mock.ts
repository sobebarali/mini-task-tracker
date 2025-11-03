import redisMock from "redis-mock";

// Create a mock Redis client for testing
const mockRedisClient = redisMock.createClient();

// Mock the ioredis interface
export const mockRedis = {
	async get(key: string): Promise<string | null> {
		return new Promise((resolve, reject) => {
			mockRedisClient.get(key, (err: Error | null, reply: string | null) => {
				if (err) reject(err);
				else resolve(reply);
			});
		});
	},

	async set(
		key: string,
		value: string,
		...args: Array<string | number>
	): Promise<string> {
		return new Promise((resolve, reject) => {
			mockRedisClient.set(key, value, ...args, (err: Error | null) => {
				if (err) reject(err);
				else resolve("OK");
			});
		});
	},

	async del(...keys: string[]): Promise<number> {
		return new Promise((resolve, reject) => {
			mockRedisClient.del(keys as any, (err: Error | null, reply: number) => {
				if (err) reject(err);
				else resolve(reply);
			});
		});
	},

	async keys(pattern: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			mockRedisClient.keys(pattern, (err: Error | null, reply: string[]) => {
				if (err) reject(err);
				else resolve(reply);
			});
		});
	},

	async setex(key: string, ttl: number, value: string): Promise<string> {
		return new Promise((resolve, reject) => {
			mockRedisClient.setex(key, ttl, value, (err: Error | null) => {
				if (err) reject(err);
				else resolve("OK");
			});
		});
	},

	async flushall(): Promise<string> {
		return new Promise((resolve, reject) => {
			mockRedisClient.flushall((err: Error | null) => {
				if (err) reject(err);
				else resolve("OK");
			});
		});
	},

	async ping(): Promise<string> {
		return Promise.resolve("PONG");
	},

	status: "ready" as const,

	quit: () => Promise.resolve("OK"),
};

/**
 * Clear Redis cache between tests
 */
export async function clearRedisCache() {
	await mockRedis.flushall();
}

// Export redis for mocking
export const redis = mockRedis;
