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

describe("Integration: GET /api/tasks - Cache behavior", () => {
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
		// Clear Redis cache
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

	it("should cache task list on first request", async () => {
		await Task.create([
			{ title: "Task 1", owner: userId, status: TaskStatus.PENDING },
			{ title: "Task 2", owner: userId, status: TaskStatus.PENDING },
		]);

		// First request - should fetch from DB and cache
		const response1 = await request(app)
			.get("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response1.body.data.tasks).toHaveLength(2);

		// Check if data is cached
		// Note: The cache key includes filters even if undefined
		// Because the handler passes { status: undefined, dueDate: undefined }
		const cacheKey = `tasks:${userId}:dueDate:undefined|status:undefined`;
		const cachedData = await redis.get(cacheKey);
		expect(cachedData).toBeTruthy();

		// Second request - should use cache
		const response2 = await request(app)
			.get("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response2.body.data.tasks).toHaveLength(2);
		expect(response2.body).toEqual(response1.body);
	});

	it("should return cached data with correct structure", async () => {
		await Task.create({
			title: "Cached Task",
			owner: userId,
			status: TaskStatus.PENDING,
		});

		// First request
		await request(app)
			.get("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		// Get cached data
		const cacheKey = `tasks:${userId}:dueDate:undefined|status:undefined`;
		const cachedData = await redis.get(cacheKey);
		const parsedCache = JSON.parse(cachedData as string);

		expect(parsedCache).toHaveProperty("data");
		expect(parsedCache).toHaveProperty("error");
		expect(parsedCache.data.tasks).toHaveLength(1);
		expect(parsedCache.data.total).toBe(1);
	});
});
