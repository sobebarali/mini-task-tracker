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

describe("Integration: POST /api/tasks - Create task with all fields", () => {
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

	it("should create a task with all fields successfully", async () => {
		const taskData = {
			title: "Complete project",
			description: "Finish the task tracker implementation",
			status: TaskStatus.PENDING,
			dueDate: new Date(Date.now() + 86400000).toISOString(),
		};

		const response = await request(app)
			.post("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.send(taskData)
			.expect(201);

		expect(response.body.data).toBeDefined();
		expect(response.body.error).toBeNull();
		expect(response.body.data.title).toBe(taskData.title);
		expect(response.body.data.description).toBe(taskData.description);
		expect(response.body.data.status).toBe(TaskStatus.PENDING);
		expect(response.body.data.owner).toBe(userId);
		expect(response.body.data.id).toBeDefined();
		expect(response.body.data.createdAt).toBeDefined();

		// Verify task exists in database
		const taskInDb = await Task.findById(response.body.data.id);
		expect(taskInDb).toBeDefined();
		expect(taskInDb?.title).toBe(taskData.title);
	});
});
