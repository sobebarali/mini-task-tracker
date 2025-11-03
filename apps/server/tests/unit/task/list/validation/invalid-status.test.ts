import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/list.task";

describe("Unit: List Tasks Validator - Invalid status", () => {
	it("should reject invalid status value", () => {
		const payload = {
			status: "invalid_status",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success && result.error.issues[0]) {
			expect(result.error.issues[0].path).toContain("status");
		}
	});

	it("should reject numeric status", () => {
		const payload = {
			status: 123,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
	});

	it("should reject boolean status", () => {
		const payload = {
			status: true,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
	});
});
