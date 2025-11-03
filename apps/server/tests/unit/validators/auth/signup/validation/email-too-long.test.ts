import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../../src/apis/auth/validators/signup.auth";

describe("Unit: Signup Validator - Email too long", () => {
	it("should reject email exceeding 255 characters", () => {
		const longEmail = `${"a".repeat(250)}@example.com`; // Over 255 chars
		const payload = {
			name: "Test User",
			email: longEmail,
			password: "password123",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success && result.error.issues[0]) {
			expect(result.error.issues[0].path).toContain("email");
		}
	});
});
