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
import request from "supertest";
import { createTestApp } from "../../../../helpers/app";
import {
	clearDatabase,
	setupTestDB,
	teardownTestDB,
} from "../../../../helpers/setup";

describe("Integration: POST /api/auth/login - Incorrect password", () => {
	const app = createTestApp();

	beforeAll(async () => {
		await setupTestDB();
	});

	afterAll(async () => {
		await teardownTestDB();
	});

	beforeEach(async () => {
		await clearDatabase();
	});

	it("should reject login with incorrect password", async () => {
		// Create a test user
		const correctPassword = "password123";
		const hashedPassword = await bcrypt.hash(correctPassword, 10);
		await User.create({
			name: "Test User",
			email: "test@example.com",
			password: hashedPassword,
		});

		const loginData = {
			email: "test@example.com",
			password: "wrong_password",
		};

		const response = await request(app)
			.post("/api/auth/login")
			.send(loginData)
			.expect(401);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("UNAUTHORIZED");
		expect(response.body.data).toBeNull();
	});
});
