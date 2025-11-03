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

describe("Integration: POST /api/auth/signup - Validation: Password too short", () => {
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

	it("should reject signup with password less than 6 characters", async () => {
		const userData = {
			name: "Test User",
			email: "test@example.com",
			password: "12345", // Only 5 characters
		};

		const response = await request(app)
			.post("/api/auth/signup")
			.send(userData)
			.expect(400);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
	});
});
