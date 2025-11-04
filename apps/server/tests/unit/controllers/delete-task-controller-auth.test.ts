import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import deleteTaskController from "../../../src/apis/task/controllers/delete.task";
import deleteTaskHandler from "../../../src/apis/task/handlers/delete.task";

// Mock the handler
jest.mock("../../../src/apis/task/handlers/delete.task");

describe("Unit: Delete Task Controller - Authentication checks", () => {
	const mockDeleteTaskHandler = deleteTaskHandler as jest.MockedFunction<
		typeof deleteTaskHandler
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 401 when user is not authenticated (missing user)", async () => {
		const mockReq = {
			params: {
				id: "507f1f77bcf86cd799439012",
			},
			user: undefined, // No user
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await deleteTaskController(mockReq, mockRes);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				data: null,
				error: expect.objectContaining({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
					statusCode: 401,
				}),
			}),
		);
		expect(mockDeleteTaskHandler).not.toHaveBeenCalled();
	});
});
