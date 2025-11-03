import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TaskStatus } from "@mini-task-tracker/db";
import listTasksHandler from "../../../src/apis/task/handlers/list.task";
import list from "../../../src/apis/task/repository/list.task";
import type { typeResult } from "../../../src/apis/task/types/list.task";

// Mock the repository module
jest.mock("../../../src/apis/task/repository/list.task");

describe("Unit: List Tasks Handler - Calls repository with filters", () => {
	const mockList = list as jest.MockedFunction<typeof list>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should call repository with status filter", async () => {
		const mockResult: typeResult = {
			data: {
				tasks: [],
				total: 0,
			},
			error: null,
		};

		mockList.mockResolvedValue(mockResult);

		await listTasksHandler({
			status: TaskStatus.PENDING,
			userId: "user123",
			requestId: "req123",
		});

		expect(mockList).toHaveBeenCalledWith({
			status: TaskStatus.PENDING,
			dueDate: undefined,
			userId: "user123",
		});
	});

	it("should call repository with dueDate filter", async () => {
		const mockResult: typeResult = {
			data: {
				tasks: [],
				total: 0,
			},
			error: null,
		};

		mockList.mockResolvedValue(mockResult);

		await listTasksHandler({
			dueDate: "2025-12-31T00:00:00.000Z",
			userId: "user123",
			requestId: "req123",
		});

		expect(mockList).toHaveBeenCalledWith({
			status: undefined,
			dueDate: "2025-12-31T00:00:00.000Z",
			userId: "user123",
		});
	});

	it("should call repository with both filters", async () => {
		const mockResult: typeResult = {
			data: {
				tasks: [],
				total: 0,
			},
			error: null,
		};

		mockList.mockResolvedValue(mockResult);

		await listTasksHandler({
			status: TaskStatus.COMPLETED,
			dueDate: "2025-12-31T00:00:00.000Z",
			userId: "user123",
			requestId: "req123",
		});

		expect(mockList).toHaveBeenCalledWith({
			status: TaskStatus.COMPLETED,
			dueDate: "2025-12-31T00:00:00.000Z",
			userId: "user123",
		});
	});

	it("should call repository with no filters", async () => {
		const mockResult: typeResult = {
			data: {
				tasks: [],
				total: 0,
			},
			error: null,
		};

		mockList.mockResolvedValue(mockResult);

		await listTasksHandler({
			userId: "user123",
			requestId: "req123",
		});

		expect(mockList).toHaveBeenCalledWith({
			status: undefined,
			dueDate: undefined,
			userId: "user123",
		});
	});
});
