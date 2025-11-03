import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/get.task";

describe("Unit: Get Task Validator - Invalid ID format", () => {
	it("should reject empty taskId", () => {
		const payload = {
			taskId: "",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success && result.error.issues[0]) {
			expect(result.error.issues[0].path).toContain("taskId");
		}
	});

	it("should reject missing taskId", () => {
		const payload = {};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
	});
});
