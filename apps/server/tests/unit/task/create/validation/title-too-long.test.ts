import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/create.task";

describe("Unit: Create Task Validator - Title too long", () => {
	it("should fail validation when title exceeds 500 characters", () => {
		const payload = {
			title: "a".repeat(501),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const firstIssue = result.error.issues[0];
			if (firstIssue) {
				expect(firstIssue.path).toContain("title");
			}
		}
	});

	it("should pass validation when title is exactly 500 characters", () => {
		const payload = {
			title: "a".repeat(500),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
