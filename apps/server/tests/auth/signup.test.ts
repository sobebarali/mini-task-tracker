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
import { createTestApp } from "../helpers/app";
import { clearDatabase, setupTestDB, teardownTestDB } from "../helpers/setup";

describe("POST /api/auth/signup", () => {
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
		it("should create a new user with valid data", async () => {
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

		it("should hash the password before storing", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			};

			await request(app).post("/api/auth/signup").send(userData).expect(200);

			// Get user with password field
			const user = await User.findOne({ email: userData.email }).select(
				"+password",
			);
			expect(user?.password).toBeDefined();
			expect(user?.password).not.toBe(userData.password); // Password should be hashed
		});
	});

	describe("Validation Errors", () => {
		it("should reject signup without name", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
			};

			const response = await request(app)
				.post("/api/auth/signup")
				.send(userData)
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should reject signup without email", async () => {
			const userData = {
				name: "Test User",
				password: "password123",
			};

			const response = await request(app)
				.post("/api/auth/signup")
				.send(userData)
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should reject signup with invalid email", async () => {
			const userData = {
				name: "Test User",
				email: "invalid-email",
				password: "password123",
			};

			const response = await request(app)
				.post("/api/auth/signup")
				.send(userData)
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should reject signup without password", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
			};

			const response = await request(app)
				.post("/api/auth/signup")
				.send(userData)
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should reject signup with short password", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "short",
			};

			const response = await request(app)
				.post("/api/auth/signup")
				.send(userData)
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("should reject signup with duplicate email", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			};

			// Create first user
			await request(app).post("/api/auth/signup").send(userData).expect(200);

			// Try to create second user with same email
			const response = await request(app)
				.post("/api/auth/signup")
				.send(userData);

			expect(response.body).toHaveProperty("error");
		});
	});

	describe("Edge Cases", () => {
		it("should trim whitespace from name and email", async () => {
			const userData = {
				name: "  Test User  ",
				email: "  test@example.com  ",
				password: "password123",
			};

			const response = await request(app)
				.post("/api/auth/signup")
				.send(userData)
				.expect(200);

			expect(response.body.data.name).toBe("Test User");
			expect(response.body.data.email).toBe("test@example.com");
		});

		it("should convert email to lowercase", async () => {
			const userData = {
				name: "Test User",
				email: "TEST@EXAMPLE.COM",
				password: "password123",
			};

			const response = await request(app)
				.post("/api/auth/signup")
				.send(userData)
				.expect(200);

			expect(response.body.data.email).toBe("test@example.com");
		});
	});
});
