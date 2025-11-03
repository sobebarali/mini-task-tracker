import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { TaskStatus } from "@mini-task-tracker/db";
import * as taskRepo from "../../src/apis/tasks/repository/task.repository";
import {
	createTaskService,
	deleteTaskService,
	getTasksService,
	updateTaskService,
} from "../../src/apis/tasks/services/task.services";

// Mock the repository layer
jest.mock("../../src/apis/tasks/repository/task.repository");

describe("Task Service Error Handling", () => {
	const mockUserId = "507f1f77bcf86cd799439011";
	const mockTaskId = "507f1f77bcf86cd799439012";
	const mockRequestId = "test-request-id-12345";

	beforeEach(() => {
		jest.clearAllMocks();
		// Suppress console.log/error for cleaner test output
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("createTaskService - Error Handling", () => {
		it("should handle repository errors and return error result", async () => {
			const mockPayload = {
				title: "Test Task",
				status: TaskStatus.PENDING,
			};

			// Mock repository to throw an error
			(taskRepo.createTask as jest.Mock).mockRejectedValue(
				new Error("Database connection failed"),
			);

			const result = await createTaskService(
				mockPayload,
				mockUserId,
				mockRequestId,
			);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.message).toBe("Database connection failed");
			expect(result.error?.statusCode).toBe(500);
			expect(result.error?.requestId).toBe(mockRequestId);
		});

		it("should handle unknown errors gracefully", async () => {
			const mockPayload = {
				title: "Test Task",
			};

			// Mock repository to throw a non-Error object
			(taskRepo.createTask as jest.Mock).mockRejectedValue("Unknown error");

			const result = await createTaskService(
				mockPayload,
				mockUserId,
				mockRequestId,
			);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.statusCode).toBe(500);
		});
	});

	describe("getTasksService - Error Handling", () => {
		it("should handle repository errors and return error result", async () => {
			// Mock repository to throw an error
			(taskRepo.getTasks as jest.Mock).mockRejectedValue(
				new Error("Redis connection failed"),
			);

			const result = await getTasksService(mockUserId, mockRequestId);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.message).toBe("Redis connection failed");
			expect(result.error?.statusCode).toBe(500);
			expect(result.error?.requestId).toBe(mockRequestId);
		});

		it("should handle timeout errors", async () => {
			(taskRepo.getTasks as jest.Mock).mockRejectedValue(
				new Error("Operation timed out"),
			);

			const result = await getTasksService(mockUserId, mockRequestId);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.message).toBe("Operation timed out");
		});
	});

	describe("updateTaskService - Error Handling", () => {
		it("should handle repository errors and return error result", async () => {
			const mockPayload = {
				title: "Updated Task",
				status: TaskStatus.COMPLETED,
			};

			// Mock repository to throw an error
			(taskRepo.updateTask as jest.Mock).mockRejectedValue(
				new Error("Task not found in database"),
			);

			const result = await updateTaskService(
				mockTaskId,
				mockPayload,
				mockUserId,
				mockRequestId,
			);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.message).toBe("Task not found in database");
			expect(result.error?.statusCode).toBe(500);
			expect(result.error?.requestId).toBe(mockRequestId);
		});

		it("should handle validation errors from repository", async () => {
			const mockPayload = {
				status: TaskStatus.COMPLETED,
			};

			(taskRepo.updateTask as jest.Mock).mockRejectedValue(
				new Error("Validation failed"),
			);

			const result = await updateTaskService(
				mockTaskId,
				mockPayload,
				mockUserId,
				mockRequestId,
			);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.message).toBe("Validation failed");
		});
	});

	describe("deleteTaskService - Error Handling", () => {
		it("should handle repository errors and return error result", async () => {
			// Mock repository to throw an error
			(taskRepo.deleteTask as jest.Mock).mockRejectedValue(
				new Error("Unable to delete task"),
			);

			const result = await deleteTaskService(
				mockTaskId,
				mockUserId,
				mockRequestId,
			);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.message).toBe("Unable to delete task");
			expect(result.error?.statusCode).toBe(500);
			expect(result.error?.requestId).toBe(mockRequestId);
		});

		it("should handle permission errors", async () => {
			(taskRepo.deleteTask as jest.Mock).mockRejectedValue(
				new Error("Permission denied"),
			);

			const result = await deleteTaskService(
				mockTaskId,
				mockUserId,
				mockRequestId,
			);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.message).toBe("Permission denied");
		});
	});
});
