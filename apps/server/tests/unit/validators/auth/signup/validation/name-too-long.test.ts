import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../../src/apis/auth/validators/signup.auth";

describe("Unit: Signup Validator - Name too long", () => {
	it("should reject name exceeding 255 characters", () => {
		const payload = {
			name: "a".repeat(256),
			email: "test@example.com",
			password: "password123",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success && result.error.issues[0]) {
			expect(result.error.issues[0].path).toContain("name");
		}
	});

	it("should accept name with exactly 255 characters", () => {
		const payload = {
			name: "a".repeat(255),
			email: "test@example.com",
			password: "password123",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
