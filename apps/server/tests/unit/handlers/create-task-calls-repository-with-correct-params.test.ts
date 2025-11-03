import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TaskStatus } from "@mini-task-tracker/db";
import createTasksHandler from "../../../src/apis/task/handlers/create.task";
import create from "../../../src/apis/task/repository/create.task";
import type { typeResult } from "../../../src/apis/task/types/create.task";

// Mock the repository module
jest.mock("../../../src/apis/task/repository/create.task");

describe("Unit: Create Task Handler - Calls repository with correct params", () => {
	const mockCreate = create as jest.MockedFunction<typeof create>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should call repository with all provided fields", async () => {
		const mockResult: typeResult = {
			data: {
				id: "task123",
				title: "Test Task",
				description: "Test Description",
				status: TaskStatus.PENDING,
				owner: "user123",
				createdAt: new Date().toISOString(),
			},
			error: null,
		};

		mockCreate.mockResolvedValue(mockResult);

		await createTasksHandler({
			title: "Test Task",
			description: "Test Description",
			status: TaskStatus.PENDING,
			dueDate: "2025-12-31T00:00:00.000Z",
			userId: "user123",
			requestId: "req123",
		});

		expect(mockCreate).toHaveBeenCalledWith({
			title: "Test Task",
			description: "Test Description",
			status: TaskStatus.PENDING,
			dueDate: "2025-12-31T00:00:00.000Z",
			userId: "user123",
		});
	});

	it("should call repository with only required fields", async () => {
		const mockResult: typeResult = {
			data: {
				id: "task123",
				title: "Minimal Task",
				status: TaskStatus.PENDING,
				owner: "user123",
				createdAt: new Date().toISOString(),
			},
			error: null,
		};

		mockCreate.mockResolvedValue(mockResult);

		await createTasksHandler({
			title: "Minimal Task",
			userId: "user123",
			requestId: "req123",
		});

		expect(mockCreate).toHaveBeenCalledWith({
			title: "Minimal Task",
			description: undefined,
			status: undefined,
			dueDate: undefined,
			userId: "user123",
		});
	});

	it("should call repository exactly once", async () => {
		const mockResult: typeResult = {
			data: {
				id: "task123",
				title: "Test Task",
				status: TaskStatus.PENDING,
				owner: "user123",
				createdAt: new Date().toISOString(),
			},
			error: null,
		};

		mockCreate.mockResolvedValue(mockResult);

		await createTasksHandler({
			title: "Test Task",
			userId: "user123",
			requestId: "req123",
		});

		expect(mockCreate).toHaveBeenCalledTimes(1);
	});
});
