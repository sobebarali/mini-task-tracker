import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "@jest/globals";
import { User } from "@mini-task-tracker/db";
import request from "supertest";
import { createTestApp } from "../../../../helpers/app";
import {
	clearDatabase,
	setupTestDB,
	teardownTestDB,
} from "../../../../helpers/setup";

describe("Integration: POST /api/auth/signup - Password hashing", () => {
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

	it("should hash the password before storing", async () => {
		const userData = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		};

		await request(app).post("/api/auth/signup").send(userData).expect(200);

		// Get user with password field
		const user = await User.findOne({ email: userData.email }).select(
			"+password",
		);
		expect(user?.password).toBeDefined();
		expect(user?.password).not.toBe(userData.password); // Password should be hashed
		expect(user?.password.length).toBeGreaterThan(20); // Bcrypt hash is longer
	});
});
