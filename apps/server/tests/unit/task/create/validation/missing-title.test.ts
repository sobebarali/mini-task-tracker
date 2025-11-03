import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/create.task";

describe("Unit: Create Task Validator - Missing title", () => {
	it("should fail validation when title is missing", () => {
		const payload = {
			description: "No title",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toBeDefined();
			const firstIssue = result.error.issues[0];
			if (firstIssue) {
				expect(firstIssue.path).toContain("title");
			}
		}
	});

	it("should fail validation when title is empty string", () => {
		const payload = {
			title: "",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
	});
});
