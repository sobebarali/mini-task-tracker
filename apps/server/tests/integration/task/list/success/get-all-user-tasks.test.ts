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
import { createTestApp } from "../../../../helpers/app";
import {
	clearDatabase,
	setupTestDB,
	teardownTestDB,
} from "../../../../helpers/setup";

describe("Integration: GET /api/tasks - Get all user tasks", () => {
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

	it("should return all tasks for authenticated user", async () => {
		// Create multiple tasks
		await Task.create([
			{
				title: "Task 1",
				description: "First task",
				status: TaskStatus.PENDING,
				owner: userId,
			},
			{
				title: "Task 2",
				description: "Second task",
				status: TaskStatus.COMPLETED,
				owner: userId,
			},
			{
				title: "Task 3",
				status: TaskStatus.PENDING,
				owner: userId,
			},
		]);

		const response = await request(app)
			.get("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response.body.data).toBeDefined();
		expect(response.body.error).toBeNull();
		expect(response.body.data.tasks).toHaveLength(3);
		expect(response.body.data.total).toBe(3);

		// Verify tasks are sorted by createdAt descending
		const tasks = response.body.data.tasks;
		expect(new Date(tasks[0].createdAt).getTime()).toBeGreaterThanOrEqual(
			new Date(tasks[1].createdAt).getTime(),
		);
	});

	it("should return empty array when user has no tasks", async () => {
		const response = await request(app)
			.get("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response.body.data).toBeDefined();
		expect(response.body.error).toBeNull();
		expect(response.body.data.tasks).toEqual([]);
		expect(response.body.data.total).toBe(0);
	});

	it("should only return tasks owned by the authenticated user", async () => {
		// Create another user
		const hashedPassword = await bcrypt.hash("password456", 10);
		const otherUser = await User.create({
			name: "Other User",
			email: "other@example.com",
			password: hashedPassword,
		});

		// Create tasks for both users
		await Task.create([
			{ title: "My Task 1", owner: userId, status: TaskStatus.PENDING },
			{ title: "My Task 2", owner: userId, status: TaskStatus.PENDING },
			{
				title: "Other Task",
				owner: String(otherUser._id),
				status: TaskStatus.PENDING,
			},
		]);

		const response = await request(app)
			.get("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response.body.data.tasks).toHaveLength(2);
		expect(response.body.data.total).toBe(2);
		expect(
			response.body.data.tasks.every(
				(task: { owner: string }) => task.owner === userId,
			),
		).toBe(true);
	});
});
