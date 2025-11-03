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

describe("Integration: PUT /api/tasks/:id - Unauthorized update", () => {
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

	it("should return 404 when trying to update another user's task", async () => {
		// Create another user and their task
		const hashedPassword = await bcrypt.hash("password456", 10);
		const otherUser = await User.create({
			name: "Other User",
			email: "other@example.com",
			password: hashedPassword,
		});

		const otherUserTask = await Task.create({
			title: "Other User Task",
			status: TaskStatus.PENDING,
			owner: String(otherUser._id),
		});

		const response = await request(app)
			.put(`/api/tasks/${String(otherUserTask._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.send({ title: "Trying to update" })
			.expect(404);

		expect(response.body.data).toBeNull();
		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("NOT_FOUND");

		// Verify task was not updated
		const task = await Task.findById(otherUserTask._id);
		expect(task?.title).toBe("Other User Task");
	});
});
