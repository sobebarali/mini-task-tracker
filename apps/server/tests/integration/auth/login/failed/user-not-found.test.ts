import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "@jest/globals";
import request from "supertest";
import { createTestApp } from "../../../../helpers/app";
import {
	clearDatabase,
	setupTestDB,
	teardownTestDB,
} from "../../../../helpers/setup";

describe("Integration: POST /api/auth/login - User not found", () => {
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

	it("should reject login with non-existent email", async () => {
		const loginData = {
			email: "nonexistent@example.com",
			password: "password123",
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
