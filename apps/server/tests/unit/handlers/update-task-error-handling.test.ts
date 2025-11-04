import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import updateTaskHandler from "../../../src/apis/task/handlers/update.task";
import update from "../../../src/apis/task/repository/update.task";

// Mock the repository
jest.mock("../../../src/apis/task/repository/update.task");

describe("Unit: Update Task Handler - Error handling", () => {
	const mockUpdateRepo = update as jest.MockedFunction<typeof update>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle and return error when repository throws unexpected error", async () => {
		// Mock repository to throw error
		mockUpdateRepo.mockRejectedValueOnce(
			new Error("Database connection failed"),
		);

		const result = await updateTaskHandler({
			taskId: "507f1f77bcf86cd799439011",
			title: "Updated Task",
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
		mockUpdateRepo.mockRejectedValueOnce(new Error());

		const result = await updateTaskHandler({
			taskId: "507f1f77bcf86cd799439011",
			title: "Updated Task",
			userId: "507f1f77bcf86cd799439012",
			requestId: "test-request-id",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.code).toBe("INTERNAL_ERROR");
		expect(result.error?.message).toBe("Failed to update task");
	});
});
