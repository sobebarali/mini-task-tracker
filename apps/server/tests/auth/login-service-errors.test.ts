import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import loginRepo from "../../src/apis/auth/repository/login.auth";
import { loginAuth } from "../../src/apis/auth/services/login.auth";

// Mock the repository layer
jest.mock("../../src/apis/auth/repository/login.auth");

describe("Auth Login Service Error Handling", () => {
	const mockRequestId = "test-request-id-12345";
	const mockLoginRepo = loginRepo as jest.MockedFunction<typeof loginRepo>;

	beforeEach(() => {
		jest.clearAllMocks();
		// Suppress console.log/error for cleaner test output
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("loginAuth - Error Handling", () => {
		it("should handle repository errors and return error result", async () => {
			const mockPayload = {
				email: "test@example.com",
				password: "password123",
				requestId: mockRequestId,
			};

			// Mock repository to throw an error
			mockLoginRepo.mockRejectedValue(new Error("Database query failed"));

			const result = await loginAuth(mockPayload);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.message).toBe("Database query failed");
			expect(result.error?.statusCode).toBe(500);
			expect(result.error?.requestId).toBe(mockRequestId);
		});

		it("should handle connection timeout errors", async () => {
			const mockPayload = {
				email: "test@example.com",
				password: "password123",
				requestId: mockRequestId,
			};

			// Mock repository to throw timeout error
			mockLoginRepo.mockRejectedValue(new Error("Connection timeout"));

			const result = await loginAuth(mockPayload);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.message).toBe("Connection timeout");
		});

		it("should handle unknown errors gracefully", async () => {
			const mockPayload = {
				email: "test@example.com",
				password: "password123",
				requestId: mockRequestId,
			};

			// Mock repository to throw a non-Error object
			mockLoginRepo.mockRejectedValue("Unknown error");

			const result = await loginAuth(mockPayload);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.statusCode).toBe(500);
		});
	});
});
