import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import createTaskController from "../../../src/apis/task/controllers/create.task";
import createTaskHandler from "../../../src/apis/task/handlers/create.task";

// Mock the handler
jest.mock("../../../src/apis/task/handlers/create.task");

describe("Unit: Create Task Controller - Unexpected error handling", () => {
	const mockCreateTaskHandler = createTaskHandler as jest.MockedFunction<
		typeof createTaskHandler
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle unexpected errors and return 500", async () => {
		// Mock handler to throw unexpected error
		mockCreateTaskHandler.mockImplementation(() => {
			throw new Error("Unexpected error");
		});

		const mockReq = {
			user: {
				userId: "507f1f77bcf86cd799439011",
				email: "test@example.com",
			},
			body: {
				title: "Test Task",
			},
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await createTaskController(mockReq, mockRes);

		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				data: null,
				error: expect.objectContaining({
					code: "INTERNAL_ERROR",
					message: "Failed to process request",
					statusCode: 500,
				}),
			}),
		);
	});
});
