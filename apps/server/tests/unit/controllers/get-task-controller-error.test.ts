import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import getTaskController from "../../../src/apis/task/controllers/get.task";
import getTaskHandler from "../../../src/apis/task/handlers/get.task";

// Mock the handler
jest.mock("../../../src/apis/task/handlers/get.task");

describe("Unit: Get Task Controller - Unexpected error handling", () => {
	const mockGetTaskHandler = getTaskHandler as jest.MockedFunction<
		typeof getTaskHandler
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle unexpected errors and return 500", async () => {
		// Mock handler to throw unexpected error
		mockGetTaskHandler.mockImplementation(() => {
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

		await getTaskController(mockReq, mockRes);

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
