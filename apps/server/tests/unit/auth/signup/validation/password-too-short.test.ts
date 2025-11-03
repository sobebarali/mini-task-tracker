import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/auth/validators/signup.auth";

describe("Unit: Signup Validator - Password too short", () => {
	it("should fail validation when password is less than 6 characters", () => {
		const payload = {
			name: "Test User",
			email: "test@example.com",
			password: "12345", // Only 5 characters
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const firstIssue = result.error.issues[0];
			if (firstIssue) {
				expect(firstIssue.path).toContain("password");
			}
		}
	});
});
