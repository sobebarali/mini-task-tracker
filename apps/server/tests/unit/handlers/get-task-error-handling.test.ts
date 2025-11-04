import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import getTaskHandler from "../../../src/apis/task/handlers/get.task";
import get from "../../../src/apis/task/repository/get.task";

// Mock the repository
jest.mock("../../../src/apis/task/repository/get.task");

describe("Unit: Get Task Handler - Error handling", () => {
	const mockGetRepo = get as jest.MockedFunction<typeof get>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle and return error when repository throws unexpected error", async () => {
		// Mock repository to throw error
		mockGetRepo.mockRejectedValueOnce(new Error("Database connection failed"));

		const result = await getTaskHandler({
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
		mockGetRepo.mockRejectedValueOnce(new Error());

		const result = await getTaskHandler({
			taskId: "507f1f77bcf86cd799439011",
			userId: "507f1f77bcf86cd799439012",
			requestId: "test-request-id",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.code).toBe("INTERNAL_ERROR");
		expect(result.error?.message).toBe("Failed to get task");
	});
});
