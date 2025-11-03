import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import createTasksHandler from "../../../src/apis/task/handlers/create.task";
import create from "../../../src/apis/task/repository/create.task";

// Mock the repository module
jest.mock("../../../src/apis/task/repository/create.task");

describe("Unit: Create Task Handler - Handles repository errors", () => {
	const mockCreate = create as jest.MockedFunction<typeof create>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle repository errors gracefully", async () => {
		mockCreate.mockRejectedValue(new Error("Database connection failed"));

		const result = await createTasksHandler({
			title: "Test Task",
			userId: "user123",
			requestId: "req123",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.code).toBe("INTERNAL_ERROR");
		expect(result.error?.message).toContain("Database connection failed");
		expect(result.error?.statusCode).toBe(500);
		expect(result.error?.requestId).toBe("req123");
	});

	it("should include request ID in error response", async () => {
		mockCreate.mockRejectedValue(new Error("Test error"));

		const result = await createTasksHandler({
			title: "Test Task",
			userId: "user123",
			requestId: "custom-req-id",
		});

		expect(result.error?.requestId).toBe("custom-req-id");
	});

	it("should handle generic errors without message", async () => {
		mockCreate.mockRejectedValue(new Error());

		const result = await createTasksHandler({
			title: "Test Task",
			userId: "user123",
			requestId: "req123",
		});

		expect(result.error?.message).toBe("Failed to create task");
	});
});
