import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock the redis module
jest.mock("@mini-task-tracker/db", () => ({
	redis: {
		keys: jest.fn(),
		del: jest.fn(),
	},
}));

describe("Unit: Cache Invalidator - Handles empty cache", () => {
	let invalidateCache: any;
	let mockRedis: any;

	beforeEach(async () => {
		jest.clearAllMocks();

		// Import mocked redis
		const dbModule = await import("@mini-task-tracker/db");
		mockRedis = dbModule.redis;

		// Import function after mock is set up
		const cacheModule = await import(
			"../../../src/apis/task/helpers/cache-invalidator"
		);
		invalidateCache = cacheModule.invalidateCache;
	});

	it("should not call del when no keys found", async () => {
		mockRedis.keys.mockResolvedValue([]);

		await invalidateCache("user123");

		expect(mockRedis.keys).toHaveBeenCalled();
		expect(mockRedis.del).not.toHaveBeenCalled();
	});

	it("should handle empty key array gracefully", async () => {
		mockRedis.keys.mockResolvedValue([]);

		await expect(invalidateCache("user123")).resolves.not.toThrow();
	});

	it("should complete successfully with no keys", async () => {
		mockRedis.keys.mockResolvedValue([]);

		const result = await invalidateCache("user123");

		expect(result).toBeUndefined();
		expect(mockRedis.del).not.toHaveBeenCalled();
	});
});
