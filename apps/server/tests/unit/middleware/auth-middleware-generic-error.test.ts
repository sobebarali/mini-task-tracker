import { describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";

// Set JWT_SECRET before importing middleware
process.env.JWT_SECRET = "test-secret-key-32-characters-long";

import { authMiddleware } from "../../../src/middleware/auth.middleware";

describe("Unit: Auth Middleware - Generic error handling", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 500 when an unexpected error occurs during token verification", () => {
		// Mock jwt.verify to throw a generic error (not JsonWebTokenError)
		const originalVerify = jwt.verify;
		jwt.verify = jest.fn().mockImplementation(() => {
			throw new Error("Unexpected error");
		}) as any;

		const mockReq = {
			headers: { authorization: "Bearer some-token" },
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		const mockNext = jest.fn();

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				data: null,
				error: expect.objectContaining({
					code: "INTERNAL_ERROR",
					message: "Failed to authenticate",
					statusCode: 500,
				}),
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();

		// Restore original
		jwt.verify = originalVerify;
	});
});
