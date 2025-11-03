import { describe, expect, it } from "@jest/globals";
import { validatePayload } from "../../../../../src/apis/task/validators/delete.task";

describe("Unit: Delete Task Validator - Valid ID", () => {
	it("should validate valid MongoDB ObjectId", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.taskId).toBe(payload.taskId);
		}
	});

	it("should validate 24-character hex string", () => {
		const payload = {
			taskId: "abcdef123456789012345678",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
