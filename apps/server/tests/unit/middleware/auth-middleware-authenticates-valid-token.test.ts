import { describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";

// Set JWT_SECRET before importing middleware
process.env.JWT_SECRET = "test-secret-key-32-characters-long";

import { authMiddleware } from "../../../src/middleware/auth.middleware";

describe("Unit: Auth Middleware - Authenticates valid token", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should call next() with valid token", () => {
		const token = jwt.sign(
			{ userId: "user123", email: "test@example.com" },
			"test-secret-key-32-characters-long",
			{ expiresIn: "1h" },
		);

		const mockReq = {
			headers: { authorization: `Bearer ${token}` },
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		const mockNext = jest.fn();

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockNext).toHaveBeenCalled();
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockRes.status).not.toHaveBeenCalled();
		expect(mockRes.json).not.toHaveBeenCalled();
	});

	it("should attach user to request object", () => {
		const token = jwt.sign(
			{ userId: "user123", email: "test@example.com" },
			"test-secret-key-32-characters-long",
			{ expiresIn: "1h" },
		);

		const mockReq = {
			headers: { authorization: `Bearer ${token}` },
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		const mockNext = jest.fn();

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockReq.user).toBeDefined();
		expect(mockReq.user?.userId).toBe("user123");
		expect(mockReq.user?.email).toBe("test@example.com");
	});

	it("should preserve token payload data", () => {
		const token = jwt.sign(
			{ userId: "different-id", email: "different@example.com" },
			"test-secret-key-32-characters-long",
			{ expiresIn: "1h" },
		);

		const mockReq = {
			headers: { authorization: `Bearer ${token}` },
		} as any;

		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as any;

		const mockNext = jest.fn();

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockReq.user?.userId).toBe("different-id");
		expect(mockReq.user?.email).toBe("different@example.com");
	});
});
