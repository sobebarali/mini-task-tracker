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

describe("Integration: GET /api/tasks - Invalid status value", () => {
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

	it("should return 400 when status value is invalid", async () => {
		const response = await request(app)
			.get("/api/tasks?status=invalid_status")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(400);

		expect(response.body.data).toBeNull();
		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 when status is numeric", async () => {
		const response = await request(app)
			.get("/api/tasks?status=123")
			.set("Authorization", `Bearer ${authToken}`)
			.expect(400);

		expect(response.body.data).toBeNull();
		expect(response.body.error).toBeDefined();
	});
});
