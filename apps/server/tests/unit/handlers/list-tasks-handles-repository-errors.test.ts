import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import listTasksHandler from "../../../src/apis/task/handlers/list.task";
import list from "../../../src/apis/task/repository/list.task";

// Mock the repository module
jest.mock("../../../src/apis/task/repository/list.task");

describe("Unit: List Tasks Handler - Handles repository errors", () => {
	const mockList = list as jest.MockedFunction<typeof list>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle repository errors gracefully", async () => {
		mockList.mockRejectedValue(new Error("Database connection timeout"));

		const result = await listTasksHandler({
			userId: "user123",
			requestId: "req123",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.code).toBe("INTERNAL_ERROR");
		expect(result.error?.message).toContain("Database connection timeout");
		expect(result.error?.statusCode).toBe(500);
	});

	it("should include request ID in error response", async () => {
		mockList.mockRejectedValue(new Error("Redis error"));

		const result = await listTasksHandler({
			userId: "user123",
			requestId: "custom-req-id",
		});

		expect(result.error?.requestId).toBe("custom-req-id");
	});
});
