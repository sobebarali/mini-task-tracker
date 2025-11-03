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

describe("Task API - Filtering", () => {
	const app = createTestApp();
	let authToken: string;
	let userId: string;

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

	describe("GET /api/tasks with filters", () => {
		beforeEach(async () => {
			// Create test tasks with different statuses and due dates
			await Task.create([
				{
					title: "Pending Task 1",
					description: "First pending task",
					status: TaskStatus.PENDING,
					owner: userId,
					dueDate: new Date("2024-01-01"),
				},
				{
					title: "Pending Task 2",
					description: "Second pending task",
					status: TaskStatus.PENDING,
					owner: userId,
					dueDate: new Date("2024-02-01"),
				},
				{
					title: "Completed Task",
					description: "Completed task",
					status: TaskStatus.COMPLETED,
					owner: userId,
					dueDate: new Date("2024-01-15"),
				},
				{
					title: "Overdue Task",
					description: "Overdue task",
					status: TaskStatus.PENDING,
					owner: userId,
					dueDate: new Date("2023-12-01"),
				},
			]);
		});

		it("should return all tasks when no filters are provided", async () => {
			const response = await request(app)
				.get("/api/tasks")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.data.tasks).toHaveLength(4);
			expect(response.body.data.total).toBe(4);
		});

		it("should filter tasks by status=pending", async () => {
			const response = await request(app)
				.get("/api/tasks?status=pending")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.data.tasks).toHaveLength(3);
			expect(response.body.data.total).toBe(3);
			response.body.data.tasks.forEach((task: any) => {
				expect(task.status).toBe(TaskStatus.PENDING);
			});
		});

		it("should filter tasks by status=completed", async () => {
			const response = await request(app)
				.get("/api/tasks?status=completed")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.data.tasks).toHaveLength(1);
			expect(response.body.data.total).toBe(1);
			expect(response.body.data.tasks[0].status).toBe(TaskStatus.COMPLETED);
		});

		it("should filter tasks by dueDate", async () => {
			const response = await request(app)
				.get("/api/tasks?dueDate=2024-01-15T00:00:00.000Z")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.data.tasks).toHaveLength(3);
			expect(response.body.data.total).toBe(3);

			// All returned tasks should have dueDate <= 2024-01-15
			response.body.data.tasks.forEach((task: any) => {
				expect(new Date(task.dueDate)).toBeLessThanOrEqual(
					new Date("2024-01-15"),
				);
			});
		});

		it("should filter tasks by both status and dueDate", async () => {
			const response = await request(app)
				.get("/api/tasks?status=pending&dueDate=2024-01-01T00:00:00.000Z")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.data.tasks).toHaveLength(1);
			expect(response.body.data.total).toBe(1);
			expect(response.body.data.tasks[0].status).toBe(TaskStatus.PENDING);
			expect(response.body.data.tasks[0].title).toBe("Pending Task 1");
		});

		it("should return empty result for non-matching filters", async () => {
			const response = await request(app)
				.get("/api/tasks?status=completed&dueDate=2023-12-01T00:00:00.000Z")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.data.tasks).toHaveLength(0);
			expect(response.body.data.total).toBe(0);
		});

		it("should reject invalid status filter", async () => {
			const response = await request(app)
				.get("/api/tasks?status=invalid")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(400);

			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should reject invalid dueDate filter", async () => {
			const response = await request(app)
				.get("/api/tasks?dueDate=invalid-date")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(400);

			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should return 401 without auth token", async () => {
			await request(app).get("/api/tasks?status=pending").expect(401);
		});
	});
});
