import { describe, expect, it, jest } from "@jest/globals";

// Set JWT_SECRET before importing middleware
process.env.JWT_SECRET = "test-secret-key-32-characters-long";

import { authMiddleware } from "../../../src/middleware/auth.middleware";

describe("Unit: Auth Middleware - Rejects invalid token", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 401 when token is malformed", () => {
		const mockReq = {
			headers: { authorization: "Bearer invalid-malformed-token" },
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		const mockNext = jest.fn();

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				data: null,
				error: expect.objectContaining({
					code: "UNAUTHORIZED",
					message: "Invalid token",
					statusCode: 401,
				}),
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 401 when token has wrong signature", () => {
		const mockReq = {
			headers: {
				authorization:
					"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.wrong_signature",
			},
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		const mockNext = jest.fn();

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				error: expect.objectContaining({
					message: "Invalid token",
				}),
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should not attach user to request when token is invalid", () => {
		const mockReq = {
			headers: { authorization: "Bearer invalid-token" },
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		const mockNext = jest.fn();

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockReq.user).toBeUndefined();
	});
});
