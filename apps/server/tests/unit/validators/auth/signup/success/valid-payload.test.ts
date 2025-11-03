import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../../src/apis/auth/validators/signup.auth";

describe("Unit: Signup Validator - Valid inputs", () => {
	it("should validate complete signup data", () => {
		const payload = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe(payload.name);
			expect(result.data.email).toBe(payload.email);
			expect(result.data.password).toBe(payload.password);
		}
	});

	it("should validate with minimum password length", () => {
		const payload = {
			name: "Test User",
			email: "test@example.com",
			password: "12345678", // Exactly 8 characters (minimum)
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
