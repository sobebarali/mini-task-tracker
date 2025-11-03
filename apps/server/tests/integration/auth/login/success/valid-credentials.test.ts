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

describe("Integration: POST /api/auth/login - Login with valid credentials", () => {
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

	it("should login successfully with correct credentials", async () => {
		// Create a test user
		const password = "password123";
		const hashedPassword = await bcrypt.hash(password, 10);
		await User.create({
			name: "Test User",
			email: "test@example.com",
			password: hashedPassword,
		});

		const loginData = {
			email: "test@example.com",
			password: password,
		};

		const response = await request(app)
			.post("/api/auth/login")
			.send(loginData)
			.expect(200);

		expect(response.body).toHaveProperty("data");
		expect(response.body).toHaveProperty("error", null);
		expect(response.body.data).toHaveProperty("token");
		expect(response.body.data).toHaveProperty("userId");
		expect(response.body.data).toHaveProperty("email", loginData.email);
		expect(response.body.data).not.toHaveProperty("password");

		// Verify token is a valid JWT
		expect(typeof response.body.data.token).toBe("string");
		expect(response.body.data.token.split(".")).toHaveLength(3); // JWT has 3 parts
	});
});
