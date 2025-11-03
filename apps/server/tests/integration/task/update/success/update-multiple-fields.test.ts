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

describe("Integration: PUT /api/tasks/:id - Update multiple fields", () => {
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

	it("should update multiple fields at once", async () => {
		const task = await Task.create({
			title: "Old Title",
			description: "Old Description",
			status: TaskStatus.PENDING,
			owner: userId,
		});

		const updateData = {
			title: "New Title",
			description: "New Description",
			status: TaskStatus.COMPLETED,
			dueDate: new Date(Date.now() + 86400000).toISOString(),
		};

		const response = await request(app)
			.put(`/api/tasks/${String(task._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.send(updateData)
			.expect(200);

		expect(response.body.data.title).toBe("New Title");
		expect(response.body.data.description).toBe("New Description");
		expect(response.body.data.status).toBe(TaskStatus.COMPLETED);
		expect(response.body.data.dueDate).toBeDefined();

		// Verify in database
		const updatedTask = await Task.findById(task._id);
		expect(updatedTask?.title).toBe("New Title");
		expect(updatedTask?.description).toBe("New Description");
		expect(updatedTask?.status).toBe(TaskStatus.COMPLETED);
	});

	it("should update only provided fields", async () => {
		const task = await Task.create({
			title: "Original Title",
			description: "Original Description",
			status: TaskStatus.PENDING,
			owner: userId,
		});

		const response = await request(app)
			.put(`/api/tasks/${String(task._id)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.send({ description: "Updated Description Only" })
			.expect(200);

		expect(response.body.data.title).toBe("Original Title");
		expect(response.body.data.description).toBe("Updated Description Only");
		expect(response.body.data.status).toBe(TaskStatus.PENDING);
	});
});
