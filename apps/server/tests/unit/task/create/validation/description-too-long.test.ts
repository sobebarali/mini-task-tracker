import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/create.task";

describe("Unit: Create Task Validator - Description too long", () => {
	it("should fail validation when description exceeds 2000 characters", () => {
		const payload = {
			title: "Valid title",
			description: "a".repeat(2001),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const firstIssue = result.error.issues[0];
			if (firstIssue) {
				expect(firstIssue.path).toContain("description");
			}
		}
	});

	it("should pass validation when description is exactly 2000 characters", () => {
		const payload = {
			title: "Valid title",
			description: "a".repeat(2000),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
