import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/auth/validators/login.auth";

describe("Unit: Login Validator - Invalid email format", () => {
	it("should fail validation with invalid email format", () => {
		const payload = {
			email: "invalid-email-format",
			password: "password123",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const firstIssue = result.error.issues[0];
			if (firstIssue) {
				expect(firstIssue.path).toContain("email");
			}
		}
	});
});
