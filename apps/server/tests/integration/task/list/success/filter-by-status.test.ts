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

describe("Integration: GET /api/tasks?status - Filter tasks by status", () => {
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

		// Create tasks with different statuses
		await Task.create([
			{ title: "Pending Task 1", status: TaskStatus.PENDING, owner: userId },
			{ title: "Pending Task 2", status: TaskStatus.PENDING, owner: userId },
			{
				title: "Completed Task 1",
				status: TaskStatus.COMPLETED,
				owner: userId,
			},
			{
				title: "Completed Task 2",
				status: TaskStatus.COMPLETED,
				owner: userId,
			},
			{
				title: "Completed Task 3",
				status: TaskStatus.COMPLETED,
				owner: userId,
			},
		]);
	});

	it("should filter tasks by pending status", async () => {
		const response = await request(app)
			.get("/api/tasks?status=pending")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response.body.data.tasks).toHaveLength(2);
		expect(response.body.data.total).toBe(2);
		expect(
			response.body.data.tasks.every(
				(task: { status: string }) => task.status === TaskStatus.PENDING,
			),
		).toBe(true);
	});

	it("should filter tasks by completed status", async () => {
		const response = await request(app)
			.get("/api/tasks?status=completed")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response.body.data.tasks).toHaveLength(3);
		expect(response.body.data.total).toBe(3);
		expect(
			response.body.data.tasks.every(
				(task: { status: string }) => task.status === TaskStatus.COMPLETED,
			),
		).toBe(true);
	});

	it("should return all tasks when no status filter is provided", async () => {
		const response = await request(app)
			.get("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response.body.data.tasks).toHaveLength(5);
		expect(response.body.data.total).toBe(5);
	});
});
