import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TaskStatus } from "@mini-task-tracker/db";
import createTasksHandler from "../../../src/apis/task/handlers/create.task";
import create from "../../../src/apis/task/repository/create.task";
import type { typeResult } from "../../../src/apis/task/types/create.task";

// Mock the repository module
jest.mock("../../../src/apis/task/repository/create.task");

describe("Unit: Create Task Handler - Returns success result", () => {
	const mockCreate = create as jest.MockedFunction<typeof create>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return success result when repository succeeds", async () => {
		const mockData = {
			id: "task123",
			title: "Test Task",
			description: "Test Description",
			status: TaskStatus.PENDING,
			owner: "user123",
			createdAt: new Date().toISOString(),
		};

		const mockResult: typeResult = {
			data: mockData,
			error: null,
		};

		mockCreate.mockResolvedValue(mockResult);

		const result = await createTasksHandler({
			title: "Test Task",
			description: "Test Description",
			userId: "user123",
			requestId: "req123",
		});

		expect(result.data).toEqual(mockData);
		expect(result.error).toBeNull();
	});

	it("should preserve all data fields from repository", async () => {
		const mockData = {
			id: "task123",
			title: "Test Task",
			description: "Test Description",
			status: TaskStatus.COMPLETED,
			dueDate: "2025-12-31T00:00:00.000Z",
			owner: "user123",
			createdAt: "2025-01-01T00:00:00.000Z",
		};

		const mockResult: typeResult = {
			data: mockData,
			error: null,
		};

		mockCreate.mockResolvedValue(mockResult);

		const result = await createTasksHandler({
			title: "Test Task",
			description: "Test Description",
			status: TaskStatus.COMPLETED,
			dueDate: "2025-12-31T00:00:00.000Z",
			userId: "user123",
			requestId: "req123",
		});

		expect(result.data?.id).toBe("task123");
		expect(result.data?.title).toBe("Test Task");
		expect(result.data?.description).toBe("Test Description");
		expect(result.data?.status).toBe("completed");
		expect(result.data?.dueDate).toBe("2025-12-31T00:00:00.000Z");
		expect(result.data?.owner).toBe("user123");
	});
});
