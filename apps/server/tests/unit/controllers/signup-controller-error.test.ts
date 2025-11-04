import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { signupAuth as signupController } from "../../../src/apis/auth/controllers/signup.auth";
import { signupAuth as signupService } from "../../../src/apis/auth/services/signup.auth";

// Mock the service
jest.mock("../../../src/apis/auth/services/signup.auth");

describe("Unit: Signup Auth Controller - Unexpected error handling", () => {
	const mockSignupService = signupService as jest.MockedFunction<
		typeof signupService
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle unexpected errors and return 500", async () => {
		// Mock service to throw unexpected error
		mockSignupService.mockImplementation(() => {
			throw new Error("Unexpected error");
		});

		const mockReq = {
			body: {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			},
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		await signupController(mockReq, mockRes);

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
