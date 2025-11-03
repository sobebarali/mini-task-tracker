import { describe, expect, it } from "@jest/globals";
import { TaskStatus } from "@mini-task-tracker/db";
import { validatePayload } from "../../../../../../src/apis/task/validators/update.task";

describe("Unit: Update Task Validator - Valid inputs", () => {
	it("should validate title update", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			title: "Updated Task Title",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe(payload.title);
		}
	});

	it("should validate status update", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			status: TaskStatus.COMPLETED,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe(TaskStatus.COMPLETED);
		}
	});

	it("should validate description update", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			description: "Updated description",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe(payload.description);
		}
	});

	it("should validate multiple field updates", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
			title: "New Title",
			description: "New Description",
			status: TaskStatus.COMPLETED,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe(payload.title);
			expect(result.data.description).toBe(payload.description);
			expect(result.data.status).toBe(TaskStatus.COMPLETED);
		}
	});

	it("should reject empty payload without taskId", () => {
		const payload = {};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
	});

	it("should reject payload with only taskId", () => {
		const payload = {
			taskId: "507f1f77bcf86cd799439011",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(false);
	});
});
