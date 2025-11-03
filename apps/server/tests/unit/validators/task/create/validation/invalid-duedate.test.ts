import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../../src/apis/task/validators/create.task";

describe("Unit: Create Task Validator - Invalid dueDate", () => {
	it("should fail validation with invalid date format", () => {
		const payload = {
			title: "Valid title",
			dueDate: "not-a-date",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			const firstIssue = result.error.issues[0];
			if (firstIssue) {
				expect(firstIssue.path).toContain("dueDate");
			}
		}
	});

	it("should fail validation with plain date string", () => {
		const payload = {
			title: "Valid title",
			dueDate: "2024-01-01",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
	});

	it("should pass validation with ISO datetime string", () => {
		const payload = {
			title: "Valid title",
			dueDate: new Date().toISOString(),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
