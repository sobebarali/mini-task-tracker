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
import { createTestApp } from "../helpers/app";
import { clearRedisCache } from "../helpers/redis-mock";
import { clearDatabase, setupTestDB, teardownTestDB } from "../helpers/setup";

// Redis is already mocked via moduleNameMapper in jest.config.js
// Type assertion for the mocked redis client
interface MockRedisClient {
	get(key: string): Promise<string | null>;
	set(
		key: string,
		value: string,
		...args: Array<string | number>
	): Promise<string>;
	del(key: string): Promise<number>;
	setex(key: string, ttl: number, value: string): Promise<string>;
}

const mockRedis = redis as unknown as MockRedisClient;

describe("Redis Caching for Tasks", () => {
	const app = createTestApp();
	let authToken: string;
	let userId: string;

	beforeAll(async () => {
		await setupTestDB();
		process.env.JWT_SECRET = "test-secret-key-for-testing-purposes";
	});

	afterAll(async () => {
		await teardownTestDB();
	});

	beforeEach(async () => {
		await clearDatabase();
		await clearRedisCache();

		// Create test user
		const hashedPassword = await bcrypt.hash("password123", 10);
		const user = await User.create({
			name: "Test User",
			email: "test@example.com",
			password: hashedPassword,
		});
		userId = String(user._id);
		authToken = jwt.sign(
			{ userId: userId, email: user.email },
			process.env.JWT_SECRET || "test-secret",
			{ expiresIn: "1h" },
		);
	});

	describe("Cache Hit Scenarios", () => {
		it("should cache GET /api/tasks response", async () => {
			// Create tasks
			await Task.create([
				{ title: "Task 1", owner: userId, status: TaskStatus.PENDING },
				{ title: "Task 2", owner: userId, status: TaskStatus.PENDING },
			]);

			// First request - should fetch from database
			const response1 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response1.body.data.tasks).toHaveLength(2);

			// Verify cache was set
			const cacheKey = `tasks:${userId}`;
			const cachedData = await mockRedis.get(cacheKey);
			expect(cachedData).toBeTruthy();

			// Second request - should fetch from cache
			const response2 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response2.body.data.tasks).toHaveLength(2);
			expect(response2.body).toEqual(response1.body);
		});

		it("should have user-specific cache keys", async () => {
			// Create another user
			const hashedPassword = await bcrypt.hash("password123", 10);
			const user2 = await User.create({
				name: "User 2",
				email: "user2@example.com",
				password: hashedPassword,
			});
			const user2Id = String(user2._id);
			const authToken2 = jwt.sign(
				{ userId: user2Id, email: user2.email },
				process.env.JWT_SECRET || "test-secret",
				{ expiresIn: "1h" },
			);

			// Create different tasks for each user
			await Task.create([
				{ title: "User 1 Task", owner: userId, status: TaskStatus.PENDING },
			]);
			await Task.create([
				{ title: "User 2 Task", owner: user2Id, status: TaskStatus.PENDING },
			]);

			// User 1 gets tasks
			const response1 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response1.body.data.tasks).toHaveLength(1);
			expect(response1.body.data.tasks[0].title).toBe("User 1 Task");

			// User 2 gets tasks
			const response2 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken2}`)
				.expect(200);

			expect(response2.body.data.tasks).toHaveLength(1);
			expect(response2.body.data.tasks[0].title).toBe("User 2 Task");

			// Verify separate cache keys exist
			const cache1 = await mockRedis.get(`tasks:${userId}`);
			const cache2 = await mockRedis.get(`tasks:${user2Id}`);
			expect(cache1).toBeTruthy();
			expect(cache2).toBeTruthy();
			expect(cache1).not.toEqual(cache2);
		});
	});

	describe("Cache Invalidation on Create", () => {
		it("should invalidate cache when creating a new task", async () => {
			// First, get tasks to populate cache
			await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			// Verify cache exists
			let cachedData = await mockRedis.get(`tasks:${userId}`);
			expect(cachedData).toBeTruthy();

			// Create a new task
			await request(app)
				.post("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ title: "New Task" })
				.expect(201);

			// Verify cache was invalidated
			cachedData = await mockRedis.get(`tasks:${userId}`);
			expect(cachedData).toBeNull();
		});

		it("should return updated data after cache invalidation on create", async () => {
			// Get initial tasks (empty)
			const response1 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response1.body.data.tasks).toHaveLength(0);

			// Create a new task
			await request(app)
				.post("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ title: "New Task" })
				.expect(201);

			// Get tasks again - should return updated data
			const response2 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response2.body.data.tasks).toHaveLength(1);
			expect(response2.body.data.tasks[0].title).toBe("New Task");
		});
	});

	describe("Cache Invalidation on Update", () => {
		it("should invalidate cache when updating a task", async () => {
			// Create a task
			const task = await Task.create({
				title: "Original Task",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			// Get tasks to populate cache
			await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			// Verify cache exists
			let cachedData = await mockRedis.get(`tasks:${userId}`);
			expect(cachedData).toBeTruthy();

			// Update the task
			await request(app)
				.put(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({ title: "Updated Task" })
				.expect(200);

			// Verify cache was invalidated
			cachedData = await mockRedis.get(`tasks:${userId}`);
			expect(cachedData).toBeNull();
		});

		it("should return updated data after cache invalidation on update", async () => {
			// Create a task
			const task = await Task.create({
				title: "Original Task",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			// Get tasks
			const response1 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response1.body.data.tasks[0].title).toBe("Original Task");

			// Update the task
			await request(app)
				.put(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({ title: "Updated Task" })
				.expect(200);

			// Get tasks again - should return updated data
			const response2 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response2.body.data.tasks[0].title).toBe("Updated Task");
		});
	});

	describe("Cache Invalidation on Delete", () => {
		it("should invalidate cache when deleting a task", async () => {
			// Create a task
			const task = await Task.create({
				title: "Task to Delete",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			// Get tasks to populate cache
			await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			// Verify cache exists
			let cachedData = await mockRedis.get(`tasks:${userId}`);
			expect(cachedData).toBeTruthy();

			// Delete the task
			await request(app)
				.delete(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			// Verify cache was invalidated
			cachedData = await mockRedis.get(`tasks:${userId}`);
			expect(cachedData).toBeNull();
		});

		it("should return updated data after cache invalidation on delete", async () => {
			// Create tasks
			const task1 = await Task.create({
				title: "Task 1",
				owner: userId,
				status: TaskStatus.PENDING,
			});
			await Task.create({
				title: "Task 2",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			// Get tasks
			const response1 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response1.body.data.tasks).toHaveLength(2);

			// Delete one task
			await request(app)
				.delete(`/api/tasks/${task1._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			// Get tasks again - should return updated data
			const response2 = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response2.body.data.tasks).toHaveLength(1);
			expect(response2.body.data.tasks[0].title).toBe("Task 2");
		});
	});

	describe("Cache Isolation Between Users", () => {
		it("should not invalidate other users' cache", async () => {
			// Create another user
			const hashedPassword = await bcrypt.hash("password123", 10);
			const user2 = await User.create({
				name: "User 2",
				email: "user2@example.com",
				password: hashedPassword,
			});
			const user2Id = String(user2._id);
			const authToken2 = jwt.sign(
				{ userId: user2Id, email: user2.email },
				process.env.JWT_SECRET || "test-secret",
				{ expiresIn: "1h" },
			);

			// Create tasks for both users
			await Task.create([
				{ title: "User 1 Task", owner: userId, status: TaskStatus.PENDING },
			]);
			await Task.create([
				{ title: "User 2 Task", owner: user2Id, status: TaskStatus.PENDING },
			]);

			// Both users get tasks (populate cache)
			await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken2}`)
				.expect(200);

			// User 1 creates a new task
			await request(app)
				.post("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ title: "User 1 New Task" })
				.expect(201);

			// User 1's cache should be invalidated
			const cache1 = await mockRedis.get(`tasks:${userId}`);
			expect(cache1).toBeNull();

			// User 2's cache should still exist
			const cache2 = await mockRedis.get(`tasks:${user2Id}`);
			expect(cache2).toBeTruthy();
		});
	});
});
