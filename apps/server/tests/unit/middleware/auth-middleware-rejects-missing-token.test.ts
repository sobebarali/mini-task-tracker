import { describe, expect, it, jest } from "@jest/globals";

// Set JWT_SECRET before importing middleware
process.env.JWT_SECRET = "test-secret-key-32-characters-long";

import { authMiddleware } from "../../../src/middleware/auth.middleware";

describe("Unit: Auth Middleware - Rejects missing token", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 401 when authorization header is missing", () => {
		const mockReq = {
			headers: {},
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
					message: "No token provided",
					statusCode: 401,
				}),
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 401 when authorization header is empty", () => {
		const mockReq = {
			headers: { authorization: "" },
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		const mockNext = jest.fn();

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 401 when Bearer prefix is missing", () => {
		const mockReq = {
			headers: { authorization: "some-token" },
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
					message: "No token provided",
				}),
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should not call next() when token is missing", () => {
		const mockReq = {
			headers: {},
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		const mockNext = jest.fn();

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockNext).not.toHaveBeenCalled();
	});
});
