import { describe, expect, it } from "@jest/globals";
import { Types } from "mongoose";
import { taskToPlain } from "../../../src/apis/task/helpers/task-transformer";

describe("Unit: Task Transformer - Transforms task with all fields", () => {
	it("should transform task document to plain object", () => {
		const mockTask = {
			_id: new Types.ObjectId("507f1f77bcf86cd799439011"),
			title: "Test Task",
			description: "Test Description",
			status: "pending",
			dueDate: new Date("2025-12-31T00:00:00.000Z"),
			owner: new Types.ObjectId("507f1f77bcf86cd799439012"),
			createdAt: new Date("2025-01-01T00:00:00.000Z"),
		} as any;

		const result = taskToPlain(mockTask);

		expect(result.id).toBe("507f1f77bcf86cd799439011");
		expect(result.title).toBe("Test Task");
		expect(result.description).toBe("Test Description");
		expect(result.status).toBe("pending");
		expect(result.dueDate).toBe("2025-12-31T00:00:00.000Z");
		expect(result.owner).toBe("507f1f77bcf86cd799439012");
		expect(result.createdAt).toBe("2025-01-01T00:00:00.000Z");
	});

	it("should convert ObjectId to string for id field", () => {
		const mockTask = {
			_id: new Types.ObjectId(),
			title: "Test",
			status: "pending",
			owner: new Types.ObjectId(),
			createdAt: new Date(),
		} as any;

		const result = taskToPlain(mockTask);

		expect(typeof result.id).toBe("string");
		expect(result.id).toMatch(/^[a-f0-9]{24}$/);
	});

	it("should convert ObjectId to string for owner field", () => {
		const ownerId = new Types.ObjectId();
		const mockTask = {
			_id: new Types.ObjectId(),
			title: "Test",
			status: "pending",
			owner: ownerId,
			createdAt: new Date(),
		} as any;

		const result = taskToPlain(mockTask);

		expect(typeof result.owner).toBe("string");
		expect(result.owner).toBe(String(ownerId));
	});

	it("should convert Date to ISO string for createdAt", () => {
		const mockTask = {
			_id: new Types.ObjectId(),
			title: "Test",
			status: "completed",
			owner: new Types.ObjectId(),
			createdAt: new Date("2025-01-15T10:30:45.000Z"),
		} as any;

		const result = taskToPlain(mockTask);

		expect(typeof result.createdAt).toBe("string");
		expect(result.createdAt).toBe("2025-01-15T10:30:45.000Z");
	});
});
