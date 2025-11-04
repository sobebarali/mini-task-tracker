import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import updateTaskController from "../../../src/apis/task/controllers/update.task";
import updateTaskHandler from "../../../src/apis/task/handlers/update.task";

// Mock the handler
jest.mock("../../../src/apis/task/handlers/update.task");

describe("Unit: Update Task Controller - Authentication checks", () => {
	const mockUpdateTaskHandler = updateTaskHandler as jest.MockedFunction<
		typeof updateTaskHandler
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 401 when user is not authenticated (missing user)", async () => {
		const mockReq = {
			params: {
				id: "507f1f77bcf86cd799439012",
			},
			body: {
				title: "Updated Task",
			},
			user: undefined, // No user
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await updateTaskController(mockReq, mockRes);

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
		expect(mockUpdateTaskHandler).not.toHaveBeenCalled();
	});
});
