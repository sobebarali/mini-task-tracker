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

describe("Integration: POST /api/auth/login - Empty fields", () => {
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

	it("should return 400 when email is empty string", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.send({
				email: "",
				password: "password123",
			})
			.expect(400);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
		expect(response.body.data).toBeNull();
	});

	it("should return 400 when password is empty string", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.send({
				email: "test@example.com",
				password: "",
			})
			.expect(400);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 when both fields are empty", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.send({
				email: "",
				password: "",
			})
			.expect(400);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
	});
});
