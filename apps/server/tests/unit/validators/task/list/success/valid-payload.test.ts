import { describe, expect, it } from "@jest/globals";
import { TaskStatus } from "@mini-task-tracker/db";
import { validatePayload } from "../../../../../../src/apis/task/validators/list.task";

describe("Unit: List Tasks Validator - Valid inputs", () => {
	it("should validate empty query params", () => {
		const payload = {};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});

	it("should validate status filter with pending", () => {
		const payload = {
			status: TaskStatus.PENDING,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe(TaskStatus.PENDING);
		}
	});

	it("should validate status filter with completed", () => {
		const payload = {
			status: TaskStatus.COMPLETED,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe(TaskStatus.COMPLETED);
		}
	});

	it("should validate undefined status", () => {
		const payload = {
			status: undefined,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
	});
});
