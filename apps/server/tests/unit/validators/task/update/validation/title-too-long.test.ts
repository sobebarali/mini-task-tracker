import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../../src/apis/task/validators/update.task";

describe("Unit: Update Task Validator - Title too long", () => {
	it("should reject title exceeding 500 characters", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			title: "a".repeat(501),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const titleError = result.error.issues.find((issue) =>
				issue.path.includes("title"),
			);
			expect(titleError).toBeDefined();
		}
	});

	it("should accept title with exactly 500 characters", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			title: "a".repeat(500),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
