import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../../src/apis/auth/validators/login.auth";

describe("Unit: Login Validator - Valid inputs", () => {
	it("should validate complete login data", () => {
		const payload = {
			email: "test@example.com",
			password: "password123",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.email).toBe(payload.email);
			expect(result.data.password).toBe(payload.password);
		}
	});
});
