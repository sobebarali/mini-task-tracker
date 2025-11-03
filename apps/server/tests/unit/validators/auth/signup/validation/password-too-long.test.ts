import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../../src/apis/auth/validators/signup.auth";

describe("Unit: Signup Validator - Password too long", () => {
	it("should reject password exceeding 255 characters", () => {
		const payload = {
			name: "Test User",
			email: "test@example.com",
			password: "a".repeat(256),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success && result.error.issues[0]) {
			expect(result.error.issues[0].path).toContain("password");
		}
	});

	it("should accept password with exactly 255 characters", () => {
		const payload = {
			name: "Test User",
			email: "test@example.com",
			password: "a".repeat(255),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
