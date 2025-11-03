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

describe("Integration: POST /api/auth/signup - Email too long", () => {
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

	it("should return 400 when email exceeds 255 characters", async () => {
		const longEmail = `${"a".repeat(250)}@example.com`;
		const userData = {
			name: "Test User",
			email: longEmail,
			password: "password123",
		};

		const response = await request(app)
			.post("/api/auth/signup")
			.send(userData)
			.expect(400);

		expect(response.body.data).toBeNull();
		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");

		// Verify user was not created
		const user = await User.findOne({ email: userData.email });
		expect(user).toBeNull();
	});
});
