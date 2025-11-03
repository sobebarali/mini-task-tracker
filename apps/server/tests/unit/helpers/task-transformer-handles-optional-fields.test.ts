import { describe, expect, it } from "@jest/globals";
import { Types } from "mongoose";
import { taskToPlain } from "../../../src/apis/task/helpers/task-transformer";

describe("Unit: Task Transformer - Handles optional fields", () => {
	it("should handle missing description field", () => {
		const mockTask = {
			_id: new Types.ObjectId(),
			title: "Test Task",
			description: undefined,
			status: "pending",
			dueDate: undefined,
			owner: new Types.ObjectId(),
			createdAt: new Date(),
		} as any;

		const result = taskToPlain(mockTask);

		expect(result.description).toBeUndefined();
	});

	it("should handle missing dueDate field", () => {
		const mockTask = {
			_id: new Types.ObjectId(),
			title: "Test Task",
			status: "pending",
			dueDate: undefined,
			owner: new Types.ObjectId(),
			createdAt: new Date(),
		} as any;

		const result = taskToPlain(mockTask);

		expect(result.dueDate).toBeUndefined();
	});

	it("should transform task with only required fields", () => {
		const mockTask = {
			_id: new Types.ObjectId("507f1f77bcf86cd799439011"),
			title: "Minimal Task",
			status: "pending",
			owner: new Types.ObjectId("507f1f77bcf86cd799439012"),
			createdAt: new Date("2025-01-01T00:00:00.000Z"),
		} as any;

		const result = taskToPlain(mockTask);

		expect(result.id).toBe("507f1f77bcf86cd799439011");
		expect(result.title).toBe("Minimal Task");
		expect(result.status).toBe("pending");
		expect(result.owner).toBe("507f1f77bcf86cd799439012");
		expect(result.createdAt).toBe("2025-01-01T00:00:00.000Z");
		expect(result.description).toBeUndefined();
		expect(result.dueDate).toBeUndefined();
	});

	it("should convert dueDate to ISO string when present", () => {
		const mockTask = {
			_id: new Types.ObjectId(),
			title: "Test Task",
			status: "pending",
			dueDate: new Date("2025-12-31T23:59:59.999Z"),
			owner: new Types.ObjectId(),
			createdAt: new Date(),
		} as any;

		const result = taskToPlain(mockTask);

		expect(result.dueDate).toBe("2025-12-31T23:59:59.999Z");
	});
});
