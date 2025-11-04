import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { loginAuth as loginController } from "../../../src/apis/auth/controllers/login.auth";
import { loginAuth as loginService } from "../../../src/apis/auth/services/login.auth";

// Mock the service
jest.mock("../../../src/apis/auth/services/login.auth");

describe("Unit: Login Auth Controller - Unexpected error handling", () => {
	const mockLoginService = loginService as jest.MockedFunction<
		typeof loginService
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle unexpected errors and return 500", async () => {
		// Mock service to throw unexpected error
		mockLoginService.mockImplementation(() => {
			throw new Error("Unexpected error");
		});

		const mockReq = {
			body: {
				email: "test@example.com",
				password: "password123",
			},
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await loginController(mockReq, mockRes);

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
