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
import mongoose from "mongoose";
import request from "supertest";
import { createTestApp } from "../../../../helpers/app";
import {
	clearDatabase,
	setupTestDB,
	teardownTestDB,
} from "../../../../helpers/setup";

describe("Integration: PUT /api/tasks/:id - Task not found", () => {
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

	it("should return 404 when updating non-existent task", async () => {
		const nonExistentId = new mongoose.Types.ObjectId();

		const response = await request(app)
			.put(`/api/tasks/${String(nonExistentId)}`)
			.set("Authorization", `Bearer ${authToken}`)
			.send({ title: "Updated Title" })
			.expect(404);

		expect(response.body.data).toBeNull();
		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("NOT_FOUND");
	});
});
