import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import deleteTaskHandler from "../../../src/apis/task/handlers/delete.task";
import remove from "../../../src/apis/task/repository/delete.task";

// Mock the repository
jest.mock("../../../src/apis/task/repository/delete.task");

describe("Unit: Delete Task Handler - Error handling", () => {
	const mockDeleteRepo = remove as jest.MockedFunction<typeof remove>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle and return error when repository throws unexpected error", async () => {
		// Mock repository to throw error
		mockDeleteRepo.mockRejectedValueOnce(
			new Error("Database connection failed"),
		);

		const result = await deleteTaskHandler({
			taskId: "507f1f77bcf86cd799439011",
			userId: "507f1f77bcf86cd799439012",
			requestId: "test-request-id",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.code).toBe("INTERNAL_ERROR");
		expect(result.error?.message).toBe("Database connection failed");
		expect(result.error?.statusCode).toBe(500);
		expect(result.error?.requestId).toBe("test-request-id");
	});

	it("should handle error with missing message", async () => {
		// Mock repository to throw error without message
		mockDeleteRepo.mockRejectedValueOnce(new Error());

		const result = await deleteTaskHandler({
			taskId: "507f1f77bcf86cd799439011",
			userId: "507f1f77bcf86cd799439012",
			requestId: "test-request-id",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.code).toBe("INTERNAL_ERROR");
		expect(result.error?.message).toBe("Failed to delete task");
	});
});
