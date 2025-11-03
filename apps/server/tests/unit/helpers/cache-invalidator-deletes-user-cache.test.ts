import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock the redis module
jest.mock("@mini-task-tracker/db", () => ({
	redis: {
		keys: jest.fn(),
		del: jest.fn(),
	},
}));

describe("Unit: Cache Invalidator - Deletes user cache", () => {
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

	it("should find keys with correct pattern", async () => {
		mockRedis.keys.mockResolvedValue([
			"tasks:user123:all",
			"tasks:user123:pending",
		]);
		mockRedis.del.mockResolvedValue(2);

		await invalidateCache("user123");

		expect(mockRedis.keys).toHaveBeenCalledWith("tasks:user123*");
		expect(mockRedis.keys).toHaveBeenCalledTimes(1);
	});

	it("should delete all matching keys", async () => {
		mockRedis.keys.mockResolvedValue([
			"tasks:user123:all",
			"tasks:user123:pending",
			"tasks:user123:completed",
		]);
		mockRedis.del.mockResolvedValue(3);

		await invalidateCache("user123");

		expect(mockRedis.del).toHaveBeenCalledWith(
			"tasks:user123:all",
			"tasks:user123:pending",
			"tasks:user123:completed",
		);
		expect(mockRedis.del).toHaveBeenCalledTimes(1);
	});

	it("should use user-specific pattern", async () => {
		mockRedis.keys.mockResolvedValue([]);

		await invalidateCache("different-user-id");

		expect(mockRedis.keys).toHaveBeenCalledWith("tasks:different-user-id*");
	});
});
