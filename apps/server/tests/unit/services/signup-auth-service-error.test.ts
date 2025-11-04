import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { signupAuth } from "../../../src/apis/auth/services/signup.auth";
import signup from "../../../src/apis/auth/repository/signup.auth";

// Mock the repository
jest.mock("../../../src/apis/auth/repository/signup.auth");

describe("Unit: Signup Auth Service - Error handling", () => {
	const mockSignupRepo = signup as jest.MockedFunction<typeof signup>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle and return error when repository throws unexpected error", async () => {
		// Mock repository to throw error
		mockSignupRepo.mockRejectedValueOnce(
			new Error("Database connection failed"),
		);

		const result = await signupAuth({
			name: "Test User",
			email: "test@example.com",
			password: "password123",
			requestId: "test-request-id",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.code).toBe("INTERNAL_ERROR");
		expect(result.error?.message).toBe("Database connection failed");
		expect(result.error?.statusCode).toBe(500);
		expect(result.error?.requestId).toBe("test-request-id");
	});

	it("should handle error with missing message", async () => {
		// Mock repository to throw error without message
		mockSignupRepo.mockRejectedValueOnce(new Error());

		const result = await signupAuth({
			name: "Test User",
			email: "test@example.com",
			password: "password123",
			requestId: "test-request-id",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.code).toBe("INTERNAL_ERROR");
		expect(result.error?.message).toBe("Failed to create user");
	});
});
