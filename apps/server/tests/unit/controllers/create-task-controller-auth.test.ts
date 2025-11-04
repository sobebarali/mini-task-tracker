import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import createTaskController from "../../../src/apis/task/controllers/create.task";
import createTaskHandler from "../../../src/apis/task/handlers/create.task";

// Mock the handler
jest.mock("../../../src/apis/task/handlers/create.task");

describe("Unit: Create Task Controller - Authentication checks", () => {
	const mockCreateTaskHandler = createTaskHandler as jest.MockedFunction<
		typeof createTaskHandler
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 401 when user is not authenticated (missing user)", async () => {
		const mockReq = {
			body: {
				title: "Test Task",
			},
			user: undefined, // No user
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await createTaskController(mockReq, mockRes);

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
		expect(mockCreateTaskHandler).not.toHaveBeenCalled();
	});
});
