import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/update.task";

describe("Unit: Update Task Validator - Description too long", () => {
	it("should reject description exceeding 2000 characters", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			description: "a".repeat(2001),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const descError = result.error.issues.find((issue) =>
				issue.path.includes("description"),
			);
			expect(descError).toBeDefined();
		}
	});

	it("should accept description with exactly 2000 characters", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			description: "a".repeat(2000),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
