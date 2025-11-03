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

describe("Integration: PUT /api/tasks/:id - Update task title", () => {
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

	it("should update task title successfully", async () => {
		const task = await Task.create({
			title: "Old Title",
			description: "Description",
			status: TaskStatus.PENDING,
			owner: userId,
		});

		const updateData = {
			title: "New Title",
		};

		const response = await request(app)
			.put(`/api/tasks/${String(task._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.send(updateData)
			.expect(200);

		expect(response.body.data).toBeDefined();
		expect(response.body.error).toBeNull();
		expect(response.body.data.title).toBe("New Title");
		expect(response.body.data.description).toBe("Description");
		expect(response.body.data.id).toBe(String(task._id));

		// Verify in database
		const updatedTask = await Task.findById(task._id);
		expect(updatedTask?.title).toBe("New Title");
	});

	it("should invalidate cache after update", async () => {
		// Create task and cache list
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

		// Update task
		await request(app)
			.put(`/api/tasks/${String(task._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.send({ title: "Updated" })
			.expect(200);

		// Verify cache was invalidated
		cachedData = await redis.get(cacheKey);
		expect(cachedData).toBeNull();
	});
});
