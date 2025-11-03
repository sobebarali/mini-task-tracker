import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock dependencies - preserve TaskStatus enum
jest.mock("@mini-task-tracker/db", () => {
	const actual = jest.requireActual("@mini-task-tracker/db") as any;
	return {
		TaskStatus: actual.TaskStatus,
		Task: {
			create: jest.fn(),
		},
		redis: {
			keys: jest.fn(),
			del: jest.fn(),
		},
	};
});

jest.mock("../../../src/apis/task/helpers/task-transformer", () => ({
	taskToPlain: jest.fn(),
}));

jest.mock("../../../src/apis/task/helpers/cache-invalidator", () => ({
	invalidateCache: jest.fn(),
}));

describe("Unit: Create Task Repository - Handles database errors", () => {
	let create: any;
	let mockTask: any;
	let mockInvalidateCache: jest.Mock;

	beforeEach(async () => {
		jest.clearAllMocks();

		// Import mocked modules
		const dbModule = await import("@mini-task-tracker/db");
		mockTask = dbModule.Task;

		const cacheModule = await import(
			"../../../src/apis/task/helpers/cache-invalidator"
		);
		mockInvalidateCache = cacheModule.invalidateCache as unknown as jest.Mock;

		// Import repository after mocks
		const repoModule = await import(
			"../../../src/apis/task/repository/create.task"
		);
		create = repoModule.default;
	});

	it("should throw error when Task.create fails", async () => {
		mockTask.create.mockRejectedValue(new Error("Connection timeout"));

		await expect(
			create({
				title: "Test Task",
				userId: "user123",
			}),
		).rejects.toThrow("Database error");
	});

	it("should include original error message", async () => {
		mockTask.create.mockRejectedValue(
			new Error("Duplicate key error: email already exists"),
		);

		await expect(
			create({
				title: "Test Task",
				userId: "user123",
			}),
		).rejects.toThrow("Duplicate key error: email already exists");
	});

	it("should handle unknown error types", async () => {
		mockTask.create.mockRejectedValue("String error");

		await expect(
			create({
				title: "Test Task",
				userId: "user123",
			}),
		).rejects.toThrow("Unknown error");
	});

	it("should not invalidate cache when creation fails", async () => {
		mockTask.create.mockRejectedValue(new Error("Database error"));
		// @ts-expect-error - void function mock
		mockInvalidateCache.mockResolvedValue(undefined);

		try {
			await create({
				title: "Test Task",
				userId: "user123",
			});
		} catch {
			// Expected to throw
		}

		expect(mockInvalidateCache).not.toHaveBeenCalled();
	});
});
