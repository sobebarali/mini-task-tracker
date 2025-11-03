import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/update.task";

describe("Unit: Update Task Validator - Invalid due date", () => {
	it("should reject invalid date format", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			dueDate: "invalid-date",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const dueDateError = result.error.issues.find((issue) =>
				issue.path.includes("dueDate"),
			);
			expect(dueDateError).toBeDefined();
		}
	});

	it("should accept valid ISO date string", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			dueDate: new Date(Date.now() + 86400000).toISOString(),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
