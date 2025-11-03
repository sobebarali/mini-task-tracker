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

describe("Integration: POST /api/auth/signup - Create user with valid data", () => {
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

	it("should create a new user successfully", async () => {
		const userData = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		};

		const response = await request(app)
			.post("/api/auth/signup")
			.send(userData)
			.expect(200);

		expect(response.body).toHaveProperty("data");
		expect(response.body).toHaveProperty("error", null);
		expect(response.body.data).toHaveProperty("userId");
		expect(response.body.data).toHaveProperty("name", userData.name);
		expect(response.body.data).toHaveProperty("email", userData.email);
		expect(response.body.data).not.toHaveProperty("password");

		// Verify user was created in database
		const user = await User.findOne({ email: userData.email });
		expect(user).toBeTruthy();
		expect(user?.name).toBe(userData.name);
	});
});
