import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TaskStatus } from "@mini-task-tracker/db";

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

describe("Unit: Create Task Repository - Invalidates cache after creation", () => {
	let create: any;
	let mockTask: any;
	let mockTaskToPlain: jest.Mock;
	let mockInvalidateCache: jest.Mock;

	beforeEach(async () => {
		jest.clearAllMocks();

		// Import mocked modules
		const dbModule = await import("@mini-task-tracker/db");
		mockTask = dbModule.Task;

		const transformerModule = await import(
			"../../../src/apis/task/helpers/task-transformer"
		);
		mockTaskToPlain = transformerModule.taskToPlain as unknown as jest.Mock;

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

	it("should call invalidateCache with userId", async () => {
		const mockCreatedTask = {
			_id: "task123",
			title: "Test Task",
			status: TaskStatus.PENDING,
			owner: "user123",
			createdAt: new Date(),
		};

		mockTask.create.mockResolvedValue(mockCreatedTask);
		mockTaskToPlain.mockReturnValue({
			id: "task123",
			title: "Test Task",
			status: TaskStatus.PENDING,
			owner: "user123",
			createdAt: mockCreatedTask.createdAt.toISOString(),
		});
		// @ts-expect-error - void function mock
		mockInvalidateCache.mockResolvedValue(undefined);

		await create({
			title: "Test Task",
			userId: "user123",
		});

		expect(mockInvalidateCache).toHaveBeenCalledWith("user123");
	});

	it("should invalidate cache after task creation", async () => {
		const mockCreatedTask = {
			_id: "task123",
			title: "Test Task",
			status: TaskStatus.PENDING,
			owner: "user123",
			createdAt: new Date(),
		};

		const createOrder: string[] = [];

		mockTask.create.mockImplementation(async () => {
			createOrder.push("create");
			return mockCreatedTask;
		});

		mockTaskToPlain.mockReturnValue({
			id: "task123",
			title: "Test Task",
			status: TaskStatus.PENDING,
			owner: "user123",
			createdAt: mockCreatedTask.createdAt.toISOString(),
		});

		mockInvalidateCache.mockImplementation(async () => {
			createOrder.push("invalidate");
		});

		await create({
			title: "Test Task",
			userId: "user123",
		});

		expect(createOrder).toEqual(["create", "invalidate"]);
	});

	it("should invalidate cache with correct userId for different users", async () => {
		const mockCreatedTask = {
			_id: "task123",
			title: "Test Task",
			status: TaskStatus.PENDING,
			owner: "different-user",
			createdAt: new Date(),
		};

		mockTask.create.mockResolvedValue(mockCreatedTask);
		mockTaskToPlain.mockReturnValue({
			id: "task123",
			title: "Test Task",
			status: TaskStatus.PENDING,
			owner: "different-user",
			createdAt: mockCreatedTask.createdAt.toISOString(),
		});
		// @ts-expect-error - void function mock
		mockInvalidateCache.mockResolvedValue(undefined);

		await create({
			title: "Test Task",
			userId: "different-user",
		});

		expect(mockInvalidateCache).toHaveBeenCalledWith("different-user");
	});
});
