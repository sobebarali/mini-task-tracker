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

describe("Integration: POST /api/auth/signup - Duplicate email", () => {
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

	it("should reject signup with duplicate email", async () => {
		const userData = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		};

		// First signup - should succeed
		await request(app).post("/api/auth/signup").send(userData).expect(200);

		// Second signup with same email - should fail
		const response = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Another User",
				email: "test@example.com", // Same email
				password: "different_password",
			})
			.expect(400);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
		expect(response.body.error.message).toContain("already exists");

		// Verify only one user exists
		const users = await User.find({ email: userData.email });
		expect(users).toHaveLength(1);
	});
});
