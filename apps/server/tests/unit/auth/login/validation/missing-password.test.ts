import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/auth/validators/login.auth";

describe("Unit: Login Validator - Missing password", () => {
	it("should fail validation when password is missing", () => {
		const payload = {
			email: "test@example.com",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toBeDefined();
			const firstIssue = result.error.issues[0];
			if (firstIssue) {
				expect(firstIssue.path).toContain("password");
			}
		}
	});
});
