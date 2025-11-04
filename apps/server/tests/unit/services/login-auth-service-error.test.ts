import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { loginAuth } from "../../../src/apis/auth/services/login.auth";
import login from "../../../src/apis/auth/repository/login.auth";

// Mock the repository
jest.mock("../../../src/apis/auth/repository/login.auth");

describe("Unit: Login Auth Service - Error handling", () => {
	const mockLoginRepo = login as jest.MockedFunction<typeof login>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle and return error when repository throws unexpected error", async () => {
		// Mock repository to throw error
		mockLoginRepo.mockRejectedValueOnce(
			new Error("Database connection failed"),
		);

		const result = await loginAuth({
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
		mockLoginRepo.mockRejectedValueOnce(new Error());

		const result = await loginAuth({
			email: "test@example.com",
			password: "password123",
			requestId: "test-request-id",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeDefined();
		expect(result.error?.code).toBe("INTERNAL_ERROR");
		expect(result.error?.message).toBe("Failed to login");
	});
});
