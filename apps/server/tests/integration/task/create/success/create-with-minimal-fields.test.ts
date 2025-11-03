import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "@jest/globals";
import { User } from "@mini-task-tracker/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createTestApp } from "../../../../helpers/app";
import {
	clearDatabase,
	setupTestDB,
	teardownTestDB,
} from "../../../../helpers/setup";

describe("Integration: POST /api/tasks - Create task with minimal fields", () => {
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

	it("should create a task with only title", async () => {
		const taskData = {
			title: "Simple task",
		};

		const response = await request(app)
			.post("/api/tasks")
			.set("Authorization", `Bearer ${authToken}`)
			.send(taskData)
			.expect(201);

		expect(response.body.data).toBeDefined();
		expect(response.body.error).toBeNull();
		expect(response.body.data.title).toBe(taskData.title);
		expect(response.body.data.status).toBe("pending"); // Default status
		expect(response.body.data.owner).toBe(userId);
		expect(response.body.data.description).toBeUndefined();
		expect(response.body.data.dueDate).toBeUndefined();
	});
});
