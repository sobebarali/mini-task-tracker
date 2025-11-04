import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import listTaskController from "../../../src/apis/task/controllers/list.task";
import listTaskHandler from "../../../src/apis/task/handlers/list.task";

// Mock the handler
jest.mock("../../../src/apis/task/handlers/list.task");

describe("Unit: List Task Controller - Unexpected error handling", () => {
	const mockListTaskHandler = listTaskHandler as jest.MockedFunction<
		typeof listTaskHandler
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle unexpected errors and return 500", async () => {
		// Mock handler to throw unexpected error
		mockListTaskHandler.mockImplementation(() => {
			throw new Error("Unexpected error");
		});

		const mockReq = {
			user: {
				userId: "507f1f77bcf86cd799439011",
				email: "test@example.com",
			},
			query: {},
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await listTaskController(mockReq, mockRes);

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
