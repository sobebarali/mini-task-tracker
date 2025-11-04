import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import deleteTaskController from "../../../src/apis/task/controllers/delete.task";
import deleteTaskHandler from "../../../src/apis/task/handlers/delete.task";

// Mock the handler
jest.mock("../../../src/apis/task/handlers/delete.task");

describe("Unit: Delete Task Controller - Unexpected error handling", () => {
	const mockDeleteTaskHandler = deleteTaskHandler as jest.MockedFunction<
		typeof deleteTaskHandler
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle unexpected errors and return 500", async () => {
		// Mock handler to throw unexpected error
		mockDeleteTaskHandler.mockImplementation(() => {
			throw new Error("Unexpected error");
		});

		const mockReq = {
			user: {
				userId: "507f1f77bcf86cd799439011",
				email: "test@example.com",
			},
			params: {
				id: "507f1f77bcf86cd799439012",
			},
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await deleteTaskController(mockReq, mockRes);

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
