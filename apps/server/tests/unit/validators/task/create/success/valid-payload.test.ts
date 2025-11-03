import { describe, expect, it } from "@jest/globals";
import { TaskStatus } from "@mini-task-tracker/db";
import { validatePayload } from "../../../../../../src/apis/task/validators/create.task";

describe("Unit: Create Task Validator - Valid inputs", () => {
	it("should validate task with all fields", () => {
		const payload = {
			title: "Complete project",
			description: "Finish the task tracker",
			status: TaskStatus.PENDING,
			dueDate: new Date().toISOString(),
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe(payload.title);
			expect(result.data.description).toBe(payload.description);
			expect(result.data.status).toBe(TaskStatus.PENDING);
		}
	});

	it("should validate task with only title", () => {
		const payload = {
			title: "Minimal task",
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe(payload.title);
			expect(result.data.description).toBeUndefined();
			expect(result.data.status).toBeUndefined();
		}
	});

	it("should validate task with completed status", () => {
		const payload = {
			title: "Already done",
			status: TaskStatus.COMPLETED,
		};

		const result = validatePayload(payload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe(TaskStatus.COMPLETED);
		}
	});
});
