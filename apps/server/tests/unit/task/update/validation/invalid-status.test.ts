import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/update.task";

describe("Unit: Update Task Validator - Invalid status", () => {
	it("should reject invalid status value", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			status: "invalid_status",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const statusError = result.error.issues.find((issue) =>
				issue.path.includes("status"),
			);
			expect(statusError).toBeDefined();
		}
	});

	it("should reject numeric status", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			status: 123,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
	});
});
