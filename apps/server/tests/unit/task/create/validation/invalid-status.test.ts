import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/create.task";

describe("Unit: Create Task Validator - Invalid status", () => {
	it("should fail validation with invalid status", () => {
		const payload = {
			title: "Valid title",
			status: "invalid_status",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const firstIssue = result.error.issues[0];
			if (firstIssue) {
				expect(firstIssue.path).toContain("status");
			}
		}
	});

	it("should fail validation with numeric status", () => {
		const payload = {
			title: "Valid title",
			status: 123,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
	});
});
