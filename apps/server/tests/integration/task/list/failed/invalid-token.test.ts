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

describe("Integration: GET /api/tasks - Invalid auth token", () => {
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

	it("should return 401 when auth token is invalid", async () => {
		const response = await request(app)
			.get("/api/tasks")
			.set("Authorization", "Bearer invalid_token")
			.expect(401);

		expect(response.body.data).toBeNull();
		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("UNAUTHORIZED");
		expect(response.body.error.message).toBe("Invalid token");
	});

	it("should return 401 when auth token is expired", async () => {
		const expiredToken =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid";

		const response = await request(app)
			.get("/api/tasks")
			.set("Authorization", `Bearer ${expiredToken}`)
			.expect(401);

		expect(response.body.data).toBeNull();
		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("UNAUTHORIZED");
		expect(response.body.error.message).toBe("Invalid token");
	});
});
