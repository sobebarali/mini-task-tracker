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

describe("Integration: POST /api/tasks - Unauthorized without token", () => {
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

	it("should reject request without auth token", async () => {
		const taskData = {
			title: "Test task",
		};

		const response = await request(app)
			.post("/api/tasks")
			.send(taskData)
			.expect(401);

		expect(response.body.data).toBeNull();
		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("UNAUTHORIZED");
		expect(response.body.error.message).toBe("No token provided");
	});
});
