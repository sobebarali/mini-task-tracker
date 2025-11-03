import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/auth/validators/login.auth";

describe("Unit: Login Validator - Missing email", () => {
	it("should fail validation when email is missing", () => {
		const payload = {
			password: "password123",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toBeDefined();
			const firstIssue = result.error.issues[0];
			if (firstIssue) {
				expect(firstIssue.path).toContain("email");
			}
		}
	});
});
