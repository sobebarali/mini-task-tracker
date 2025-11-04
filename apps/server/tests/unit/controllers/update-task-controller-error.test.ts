import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import updateTaskController from "../../../src/apis/task/controllers/update.task";
import updateTaskHandler from "../../../src/apis/task/handlers/update.task";

// Mock the handler
jest.mock("../../../src/apis/task/handlers/update.task");

describe("Unit: Update Task Controller - Unexpected error handling", () => {
	const mockUpdateTaskHandler = updateTaskHandler as jest.MockedFunction<
		typeof updateTaskHandler
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle unexpected errors and return 500", async () => {
		// Mock handler to throw unexpected error
		mockUpdateTaskHandler.mockImplementation(() => {
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
			body: {
				title: "Updated Task",
			},
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await updateTaskController(mockReq, mockRes);

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
