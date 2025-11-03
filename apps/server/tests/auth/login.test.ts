import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "@jest/globals";
import { User } from "@mini-task-tracker/db";
import bcrypt from "bcrypt";
import request from "supertest";
import { createTestApp } from "../helpers/app";
import { clearDatabase, setupTestDB, teardownTestDB } from "../helpers/setup";

describe("POST /api/auth/login", () => {
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

	describe("Success Cases", () => {
		it("should login with valid credentials", async () => {
			// Create a test user
			const password = "password123";
			const hashedPassword = await bcrypt.hash(password, 10);
			await User.create({
				name: "Test User",
				email: "test@example.com",
				password: hashedPassword,
			});

			const loginData = {
				email: "test@example.com",
				password: password,
			};

			const response = await request(app)
				.post("/api/auth/login")
				.send(loginData)
				.expect(200);

			expect(response.body).toHaveProperty("data");
			expect(response.body.data).toHaveProperty("token");
			expect(response.body.data).toHaveProperty("email", loginData.email);
			expect(response.body.data).not.toHaveProperty("password");
		});

		it("should return valid JWT token", async () => {
			// Create a test user
			const password = "password123";
			const hashedPassword = await bcrypt.hash(password, 10);
			await User.create({
				name: "Test User",
				email: "test@example.com",
				password: hashedPassword,
			});

			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "test@example.com", password })
				.expect(200);

			expect(response.body.data.token).toBeTruthy();
			expect(typeof response.body.data.token).toBe("string");
			// JWT should have 3 parts separated by dots
			expect(response.body.data.token.split(".")).toHaveLength(3);
		});
	});

	describe("Validation Errors", () => {
		it("should reject login without email", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ password: "password123" })
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should reject login without password", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "test@example.com" })
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should reject login with invalid email format", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "invalid-email", password: "password123" })
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("Authentication Errors", () => {
		it("should reject login with non-existent email", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "nonexistent@example.com", password: "password123" });

			expect(response.body).toHaveProperty("error");
			expect(response.status).not.toBe(200);
		});

		it("should reject login with incorrect password", async () => {
			// Create a test user
			const hashedPassword = await bcrypt.hash("correctpassword", 10);
			await User.create({
				name: "Test User",
				email: "test@example.com",
				password: hashedPassword,
			});

			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "test@example.com", password: "wrongpassword" });

			expect(response.body).toHaveProperty("error");
			expect(response.status).not.toBe(200);
		});

		it("should be case-sensitive for password", async () => {
			// Create a test user
			const hashedPassword = await bcrypt.hash("Password123", 10);
			await User.create({
				name: "Test User",
				email: "test@example.com",
				password: hashedPassword,
			});

			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "test@example.com", password: "password123" });

			expect(response.body).toHaveProperty("error");
			expect(response.status).not.toBe(200);
		});
	});

	describe("Edge Cases", () => {
		it("should handle email case-insensitivity", async () => {
			// Create a test user with lowercase email
			const password = "password123";
			const hashedPassword = await bcrypt.hash(password, 10);
			await User.create({
				name: "Test User",
				email: "test@example.com",
				password: hashedPassword,
			});

			// Try to login with uppercase email
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "TEST@EXAMPLE.COM", password });

			// Should succeed if email normalization is implemented
			expect(response.status).toBe(200);
		});

		it("should trim whitespace from email", async () => {
			// Create a test user
			const password = "password123";
			const hashedPassword = await bcrypt.hash(password, 10);
			await User.create({
				name: "Test User",
				email: "test@example.com",
				password: hashedPassword,
			});

			// Try to login with email that has whitespace
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "  test@example.com  ", password });

			// Should succeed if trimming is implemented
			expect(response.status).toBe(200);
		});
	});
});
