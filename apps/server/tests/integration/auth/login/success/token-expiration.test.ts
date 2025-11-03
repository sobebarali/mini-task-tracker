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

describe("Integration: POST /api/auth/login - Token expiration", () => {
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

	it("should return a JWT token with 7 days expiration", async () => {
		const loginData = {
			email: "test@example.com",
			password: "password123",
		};

		const response = await request(app)
			.post("/api/auth/login")
			.send(loginData)
			.expect(200);

		expect(response.body.data).toBeDefined();
		expect(response.body.data.token).toBeDefined();

		// Verify token expiration
		const decoded = jwt.decode(response.body.data.token) as {
			exp: number;
			iat: number;
		};
		expect(decoded).toBeDefined();
		expect(decoded.exp).toBeDefined();
		expect(decoded.iat).toBeDefined();

		// Check that expiration is roughly 7 days (604800 seconds) from now
		const expirationTime = decoded.exp - decoded.iat;
		const sevenDaysInSeconds = 7 * 24 * 60 * 60;
		expect(expirationTime).toBeGreaterThanOrEqual(sevenDaysInSeconds - 10);
		expect(expirationTime).toBeLessThanOrEqual(sevenDaysInSeconds + 10);
	});
});
