import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "@jest/globals";
import { Task, User } from "@mini-task-tracker/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createTestApp } from "../../../../helpers/app";
import {
	clearDatabase,
	setupTestDB,
	teardownTestDB,
} from "../../../../helpers/setup";

describe("Integration: POST /api/tasks - Create multiple tasks", () => {
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

	it("should allow creating multiple tasks for same user", async () => {
		const task1 = { title: "Task 1" };
		const task2 = { title: "Task 2" };
		const task3 = { title: "Task 3" };

		await request(app)
			.post("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.send(task1)
			.expect(201);

		await request(app)
			.post("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.send(task2)
			.expect(201);

		await request(app)
			.post("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.send(task3)
			.expect(201);

		const tasks = await Task.find({ owner: userId });
		expect(tasks).toHaveLength(3);
		expect(tasks.map((t) => t.title)).toEqual(
			expect.arrayContaining(["Task 1", "Task 2", "Task 3"]),
		);
	});
});
