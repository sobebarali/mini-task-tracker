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

describe("Integration: POST /api/auth/signup - Empty fields", () => {
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

	it("should return 400 when name is empty string", async () => {
		const response = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "",
				email: "test@example.com",
				password: "password123",
			})
			.expect(400);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
		expect(response.body.data).toBeNull();
	});

	it("should return 400 when email is empty string", async () => {
		const response = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Test User",
				email: "",
				password: "password123",
			})
			.expect(400);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 when password is empty string", async () => {
		const response = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Test User",
				email: "test@example.com",
				password: "",
			})
			.expect(400);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 when all fields are empty", async () => {
		const response = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "",
				email: "",
				password: "",
			})
			.expect(400);

		expect(response.body.error).toBeDefined();
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
	});
});
