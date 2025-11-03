import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "@jest/globals";
import { redis, Task, TaskStatus, User } from "@mini-task-tracker/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createTestApp } from "../../../../helpers/app";
import {
	clearDatabase,
	setupTestDB,
	teardownTestDB,
} from "../../../../helpers/setup";

describe("Integration: DELETE /api/tasks/:id - Delete task", () => {
	const app = createTestApp();
	let authToken: string;
	let userId: string;

	beforeAll(async () => {
		await setupTestDB();
	});

	afterAll(async () => {
		await teardownTestDB();
	});

	beforeEach(async () => {
		await clearDatabase();
		await redis.flushall();

		const hashedPassword = await bcrypt.hash("password123", 10);
		const user = await User.create({
			name: "Test User",
			email: "test@example.com",
			password: hashedPassword,
		});
		userId = String(user._id);

		authToken = jwt.sign(
			{ userId: userId, email: user.email },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);
	});

	it("should delete task successfully", async () => {
		const task = await Task.create({
			title: "Task to delete",
			status: TaskStatus.PENDING,
			owner: userId,
		});

		const response = await request(app)
			.delete(`/api/tasks/${String(task._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response.body.data).toBeDefined();
		expect(response.body.error).toBeNull();
		expect(response.body.data.message).toContain("deleted");

		// Verify task was deleted from database
		const deletedTask = await Task.findById(task._id);
		expect(deletedTask).toBeNull();
	});

	it("should invalidate cache after delete", async () => {
		const task = await Task.create({
			title: "Task",
			status: TaskStatus.PENDING,
			owner: userId,
		});

		// Populate cache
		await request(app)
			.get("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		// Verify cache exists
		const cacheKey = `tasks:${userId}:dueDate:undefined|status:undefined`;
		let cachedData = await redis.get(cacheKey);
		expect(cachedData).toBeTruthy();

		// Delete task
		await request(app)
			.delete(`/api/tasks/${String(task._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		// Verify cache was invalidated
		cachedData = await redis.get(cacheKey);
		expect(cachedData).toBeNull();
	});

	it("should delete task with all fields", async () => {
		const task = await Task.create({
			title: "Complete Task",
			description: "With all fields",
			status: TaskStatus.COMPLETED,
			dueDate: new Date(Date.now() + 86400000),
			owner: userId,
		});

		await request(app)
			.delete(`/api/tasks/${String(task._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		const deletedTask = await Task.findById(task._id);
		expect(deletedTask).toBeNull();
	});
});
