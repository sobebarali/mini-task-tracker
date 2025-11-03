import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "@jest/globals";
import { Task, TaskStatus, User } from "@mini-task-tracker/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createTestApp } from "../helpers/app";
import { clearDatabase, setupTestDB, teardownTestDB } from "../helpers/setup";

describe("Task CRUD Operations", () => {
	const app = createTestApp();
	let authToken: string;
	let userId: string;
	let otherUserId: string;

	beforeAll(async () => {
		await setupTestDB();

		// Set JWT_SECRET for testing
		process.env.JWT_SECRET = "test-secret-key-for-testing-purposes";
	});

	afterAll(async () => {
		await teardownTestDB();
	});

	beforeEach(async () => {
		await clearDatabase();

		// Create test user 1
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

		// Create test user 2 for authorization tests
		const otherUser = await User.create({
			name: "Other User",
			email: "other@example.com",
			password: hashedPassword,
		});
		otherUserId = String(otherUser._id);
	});

	describe("POST /api/tasks - Create Task", () => {
		it("should create a task with valid data", async () => {
			const taskData = {
				title: "Test Task",
				description: "Test Description",
				status: TaskStatus.PENDING,
				dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
			};

			const response = await request(app)
				.post("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.send(taskData)
				.expect(201);

			expect(response.body).toHaveProperty("data");
			expect(response.body.data).toHaveProperty("title", taskData.title);
			expect(response.body.data).toHaveProperty(
				"description",
				taskData.description,
			);
			expect(response.body.data).toHaveProperty("owner", userId);
		});

		it("should create a task without optional fields", async () => {
			const taskData = {
				title: "Minimal Task",
			};

			const response = await request(app)
				.post("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.send(taskData)
				.expect(201);

			expect(response.body.data).toHaveProperty("title", taskData.title);
			expect(response.body.data).toHaveProperty("status", TaskStatus.PENDING);
		});

		it("should reject task creation without authentication", async () => {
			const taskData = {
				title: "Test Task",
			};

			const response = await request(app)
				.post("/api/tasks")
				.send(taskData)
				.expect(401);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("UNAUTHORIZED");
		});

		it("should reject task without title", async () => {
			const taskData = {
				description: "No title",
			};

			const response = await request(app)
				.post("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.send(taskData)
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("GET /api/tasks - List Tasks", () => {
		it("should return tasks for authenticated user", async () => {
			// Create test tasks
			await Task.create([
				{ title: "Task 1", owner: userId, status: TaskStatus.PENDING },
				{ title: "Task 2", owner: userId, status: TaskStatus.PENDING },
			]);

			const response = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body).toHaveProperty("data");
			expect(response.body.data.tasks).toHaveLength(2);
		});

		it("should return empty array when no tasks exist", async () => {
			const response = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.data.tasks).toEqual([]);
		});

		it("should only return tasks owned by the authenticated user", async () => {
			// Create tasks for both users
			await Task.create([
				{ title: "User 1 Task", owner: userId, status: TaskStatus.PENDING },
				{
					title: "Other User Task",
					owner: otherUserId,
					status: TaskStatus.PENDING,
				},
			]);

			const response = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.data.tasks).toHaveLength(1);
			expect(response.body.data.tasks[0].title).toBe("User 1 Task");
		});

		it("should reject request without authentication", async () => {
			await request(app).get("/api/tasks").expect(401);
		});
	});

	describe("PUT /api/tasks/:id - Update Task", () => {
		it("should update task with valid data", async () => {
			const task = await Task.create({
				title: "Original Task",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			const updateData = {
				title: "Updated Task",
				status: TaskStatus.COMPLETED,
			};

			const response = await request(app)
				.put(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.data.title).toBe(updateData.title);
			expect(response.body.data.status).toBe(TaskStatus.COMPLETED);
		});

		it("should update only specified fields", async () => {
			const task = await Task.create({
				title: "Original Task",
				description: "Original Description",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			const updateData = {
				status: TaskStatus.COMPLETED,
			};

			const response = await request(app)
				.put(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.data.title).toBe("Original Task");
			expect(response.body.data.status).toBe(TaskStatus.COMPLETED);
		});

		it("should not update task owned by another user", async () => {
			const task = await Task.create({
				title: "Other User Task",
				owner: otherUserId,
				status: TaskStatus.PENDING,
			});

			const response = await request(app)
				.put(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({ status: TaskStatus.COMPLETED });

			expect(response.body).toHaveProperty("error");
			expect(response.status).not.toBe(200);
		});

		it("should return 404 for non-existent task", async () => {
			const fakeId = "507f1f77bcf86cd799439011";

			const response = await request(app)
				.put(`/api/tasks/${fakeId}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({ status: TaskStatus.COMPLETED });

			expect(response.body).toHaveProperty("error");
		});

		it("should reject update without authentication", async () => {
			const task = await Task.create({
				title: "Task",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			await request(app)
				.put(`/api/tasks/${task._id}`)
				.send({ status: TaskStatus.COMPLETED })
				.expect(401);
		});
	});

	describe("DELETE /api/tasks/:id - Delete Task", () => {
		it("should delete task successfully", async () => {
			const task = await Task.create({
				title: "Task to Delete",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			await request(app)
				.delete(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			// Verify task was deleted
			const deletedTask = await Task.findById(task._id);
			expect(deletedTask).toBeNull();
		});

		it("should not delete task owned by another user", async () => {
			const task = await Task.create({
				title: "Other User Task",
				owner: otherUserId,
				status: TaskStatus.PENDING,
			});

			const response = await request(app)
				.delete(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.body).toHaveProperty("error");

			// Verify task was not deleted
			const existingTask = await Task.findById(task._id);
			expect(existingTask).toBeTruthy();
		});

		it("should return 404 for non-existent task", async () => {
			const fakeId = "507f1f77bcf86cd799439011";

			const response = await request(app)
				.delete(`/api/tasks/${fakeId}`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.body).toHaveProperty("error");
		});

		it("should reject delete without authentication", async () => {
			const task = await Task.create({
				title: "Task",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			await request(app).delete(`/api/tasks/${task._id}`).expect(401);
		});
	});

	describe("Authorization Tests", () => {
		it("should reject invalid JWT token", async () => {
			const response = await request(app)
				.get("/api/tasks")
				.set("Authorization", "Bearer invalid_token")
				.expect(401);

			expect(response.body.error.code).toBe("UNAUTHORIZED");
		});

		it("should reject expired JWT token", async () => {
			// Create expired token
			const expiredToken = jwt.sign(
				{ userId: userId, email: "test@example.com" },
				process.env.JWT_SECRET || "test-secret",
				{ expiresIn: "-1h" }, // Expired 1 hour ago
			);

			const response = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${expiredToken}`)
				.expect(401);

			expect(response.body.error.code).toBe("UNAUTHORIZED");
		});

		it("should reject request without Bearer prefix", async () => {
			const response = await request(app)
				.get("/api/tasks")
				.set("Authorization", authToken)
				.expect(401);

			expect(response.body.error.code).toBe("UNAUTHORIZED");
		});
	});

	describe("Error Handling Tests", () => {
		it("should handle service errors gracefully on create", async () => {
			// Mock service to throw error by using invalid data that will cause DB error
			// We'll test with extremely long title that exceeds DB limits
			const longTitle = "a".repeat(10000); // Way beyond 500 char limit

			const response = await request(app)
				.post("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ title: longTitle });

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should return error when service fails on getTasks", async () => {
			// Test with malformed token to trigger error in controller catch block
			// Create a token with missing userId field
			const badToken = jwt.sign(
				{ email: "test@example.com" }, // Missing userId
				process.env.JWT_SECRET || "test-secret",
				{ expiresIn: "1h" },
			);

			const response = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${badToken}`)
				.expect(401);

			expect(response.body).toHaveProperty("error");
		});

		it("should handle invalid MongoDB ObjectId on update", async () => {
			const invalidId = "invalid-id-format";

			const response = await request(app)
				.put(`/api/tasks/${invalidId}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({ title: "Updated" });

			expect(response.body).toHaveProperty("error");
		});

		it("should handle invalid MongoDB ObjectId on delete", async () => {
			const invalidId = "invalid-id-format";

			const response = await request(app)
				.delete(`/api/tasks/${invalidId}`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.body).toHaveProperty("error");
		});

		it("should handle validation errors on update with invalid data", async () => {
			const task = await Task.create({
				title: "Test Task",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			const response = await request(app)
				.put(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({ status: "INVALID_STATUS" })
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should handle empty update data", async () => {
			const task = await Task.create({
				title: "Test Task",
				owner: userId,
				status: TaskStatus.PENDING,
			});

			const response = await request(app)
				.put(`/api/tasks/${task._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({})
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});
	});
});
