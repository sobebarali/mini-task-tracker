import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import listTaskController from "../../../src/apis/task/controllers/list.task";
import listTaskHandler from "../../../src/apis/task/handlers/list.task";

// Mock the handler
jest.mock("../../../src/apis/task/handlers/list.task");

describe("Unit: List Task Controller - Authentication checks", () => {
	const mockListTaskHandler = listTaskHandler as jest.MockedFunction<
		typeof listTaskHandler
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 401 when user is not authenticated (missing user)", async () => {
		const mockReq = {
			query: {},
			user: undefined, // No user
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await listTaskController(mockReq, mockRes);

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
		expect(mockListTaskHandler).not.toHaveBeenCalled();
	});
});
