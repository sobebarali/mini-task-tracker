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

describe("Integration: GET /api/tasks/:id - Get task by ID", () => {
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

	it("should get task by ID successfully", async () => {
		const task = await Task.create({
			title: "Test Task",
			description: "Test Description",
			status: TaskStatus.PENDING,
			owner: userId,
		});

		const response = await request(app)
			.get(`/api/tasks/${String(task._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response.body.data).toBeDefined();
		expect(response.body.error).toBeNull();
		expect(response.body.data.id).toBe(String(task._id));
		expect(response.body.data.title).toBe("Test Task");
		expect(response.body.data.description).toBe("Test Description");
		expect(response.body.data.status).toBe(TaskStatus.PENDING);
		expect(response.body.data.owner).toBe(userId);
	});

	it("should get task with all fields", async () => {
		const dueDate = new Date(Date.now() + 86400000);
		const task = await Task.create({
			title: "Complete Task",
			description: "With all fields",
			status: TaskStatus.COMPLETED,
			dueDate: dueDate,
			owner: userId,
		});

		const response = await request(app)
			.get(`/api/tasks/${String(task._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.expect(200);

		expect(response.body.data.title).toBe("Complete Task");
		expect(response.body.data.description).toBe("With all fields");
		expect(response.body.data.status).toBe(TaskStatus.COMPLETED);
		expect(response.body.data.dueDate).toBeDefined();
	});
});
