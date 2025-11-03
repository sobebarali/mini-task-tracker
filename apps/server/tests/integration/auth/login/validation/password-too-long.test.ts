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

describe("Integration: POST /api/auth/login - Password too long", () => {
	const app = createTestApp();

	beforeAll(async () => {
		await setupTestDB();
	});

	afterAll(async () => {
		await teardownTestDB();
	});

	beforeEach(async () => {
		await clearDatabase();

		// Create a test user
		const hashedPassword = await bcrypt.hash("password123", 10);
		await User.create({
			name: "Test User",
			email: "test@example.com",
			password: hashedPassword,
		});
	});

	it("should return 400 when password exceeds 255 characters", async () => {
		const loginData = {
			email: "test@example.com",
			password: "a".repeat(256),
		};

		const response = await request(app)
			.post("/api/auth/login")
			.send(loginData)
			.expect(400);

		expect(response.body.data).toBeNull();
		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
	});
});
