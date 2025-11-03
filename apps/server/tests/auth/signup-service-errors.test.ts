import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import signupRepo from "../../src/apis/auth/repository/signup.auth";
import { signupAuth } from "../../src/apis/auth/services/signup.auth";

// Mock the repository layer
jest.mock("../../src/apis/auth/repository/signup.auth");

describe("Auth Signup Service Error Handling", () => {
	const mockRequestId = "test-request-id-12345";
	const mockSignupRepo = signupRepo as jest.MockedFunction<typeof signupRepo>;

	beforeEach(() => {
		jest.clearAllMocks();
		// Suppress console.log/error for cleaner test output
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("signupAuth - Error Handling", () => {
		it("should handle repository errors and return error result", async () => {
			const mockPayload = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
				requestId: mockRequestId,
			};

			// Mock repository to throw an error
			mockSignupRepo.mockRejectedValue(new Error("Database connection failed"));

			const result = await signupAuth(mockPayload);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.message).toBe("Database connection failed");
			expect(result.error?.statusCode).toBe(500);
			expect(result.error?.requestId).toBe(mockRequestId);
		});

		it("should handle duplicate email errors", async () => {
			const mockPayload = {
				name: "Test User",
				email: "duplicate@example.com",
				password: "password123",
				requestId: mockRequestId,
			};

			// Mock repository to throw duplicate key error
			mockSignupRepo.mockRejectedValue(new Error("Email already exists"));

			const result = await signupAuth(mockPayload);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.message).toBe("Email already exists");
		});

		it("should handle unknown errors gracefully", async () => {
			const mockPayload = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
				requestId: mockRequestId,
			};

			// Mock repository to throw a non-Error object
			mockSignupRepo.mockRejectedValue("Unknown error");

			const result = await signupAuth(mockPayload);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("INTERNAL_ERROR");
			expect(result.error?.statusCode).toBe(500);
		});
	});
});
