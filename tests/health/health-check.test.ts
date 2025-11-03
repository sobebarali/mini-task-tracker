import express from "express";
import request from "supertest";
import { setupTestDB, teardownTestDB } from "../helpers/setup";

// Create a minimal test app instance
const createTestApp = () => {
	const app = express();

	// Basic health check
	app.get("/", (_req, res) => {
		res.status(200).send("OK");
	});

	// Detailed health check endpoint
	app.get("/health", async (_req, res) => {
		const healthCheck = {
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV || "development",
			services: {
				mongodb: {
					status: "unknown",
					responseTime: 0,
				},
				redis: {
					status: "unknown",
					responseTime: 0,
				},
			},
		};

		try {
			const { db, redis } = await import("@mini-task-tracker/db");

			// Check MongoDB connection
			const mongoStartTime = Date.now();
			try {
				if (db.readyState === 1) {
					await db.db?.admin().ping();
					healthCheck.services.mongodb.status = "healthy";
					healthCheck.services.mongodb.responseTime =
						Date.now() - mongoStartTime;
				} else {
					healthCheck.services.mongodb.status = "disconnected";
					healthCheck.status = "degraded";
				}
			} catch (_mongoError) {
				healthCheck.services.mongodb.status = "unhealthy";
				healthCheck.status = "degraded";
			}

			// Check Redis connection
			const redisStartTime = Date.now();
			try {
				await redis.ping();
				healthCheck.services.redis.status = "healthy";
				healthCheck.services.redis.responseTime = Date.now() - redisStartTime;
			} catch (_redisError) {
				healthCheck.services.redis.status = "unhealthy";
				healthCheck.status = "degraded";
			}

			const statusCode =
				healthCheck.status === "healthy"
					? 200
					: healthCheck.status === "degraded"
						? 503
						: 500;

			res.status(statusCode).json(healthCheck);
		} catch (_error) {
			healthCheck.status = "unhealthy";
			res.status(503).json(healthCheck);
		}
	});

	// Readiness probe
	app.get("/ready", async (_req, res) => {
		try {
			const { db, redis } = await import("@mini-task-tracker/db");

			const mongoReady = db.readyState === 1;
			const redisReady = redis.status === "ready";

			if (mongoReady && redisReady) {
				res.status(200).json({
					ready: true,
					mongodb: "ready",
					redis: "ready",
				});
			} else {
				res.status(503).json({
					ready: false,
					mongodb: mongoReady ? "ready" : "not ready",
					redis: redisReady ? "ready" : "not ready",
				});
			}
		} catch (_error) {
			res.status(503).json({
				ready: false,
				error: "Failed to check readiness",
			});
		}
	});

	// Liveness probe
	app.get("/live", (_req, res) => {
		res.status(200).json({
			alive: true,
			timestamp: new Date().toISOString(),
		});
	});

	return app;
};

describe("Health Check Endpoints", () => {
	let app: express.Application;

	beforeAll(async () => {
		await setupTestDB();
		app = createTestApp();
	});

	afterAll(async () => {
		await teardownTestDB();
	});

	describe("GET /", () => {
		it("should return OK for basic health check", async () => {
			const response = await request(app).get("/").expect(200);

			expect(response.text).toBe("OK");
		});
	});

	describe("GET /health", () => {
		it("should return detailed health status", async () => {
			const response = await request(app).get("/health").expect(200);

			expect(response.body).toHaveProperty("status");
			expect(response.body).toHaveProperty("timestamp");
			expect(response.body).toHaveProperty("uptime");
			expect(response.body).toHaveProperty("environment");
			expect(response.body).toHaveProperty("services");
		});

		it("should check MongoDB connection status", async () => {
			const response = await request(app).get("/health").expect(200);

			expect(response.body.services.mongodb).toHaveProperty("status");
			expect(response.body.services.mongodb).toHaveProperty("responseTime");
			expect(response.body.services.mongodb.status).toBe("healthy");
		});

		it("should check Redis connection status", async () => {
			const response = await request(app).get("/health").expect(200);

			expect(response.body.services.redis).toHaveProperty("status");
			expect(response.body.services.redis).toHaveProperty("responseTime");
			expect(response.body.services.redis.status).toBe("healthy");
		});

		it("should return healthy status when all services are up", async () => {
			const response = await request(app).get("/health").expect(200);

			expect(response.body.status).toBe("healthy");
			expect(response.body.services.mongodb.status).toBe("healthy");
			expect(response.body.services.redis.status).toBe("healthy");
		});

		it("should include response times for services", async () => {
			const response = await request(app).get("/health").expect(200);

			expect(
				response.body.services.mongodb.responseTime,
			).toBeGreaterThanOrEqual(0);
			expect(response.body.services.redis.responseTime).toBeGreaterThanOrEqual(
				0,
			);
		});

		it("should include process uptime", async () => {
			const response = await request(app).get("/health").expect(200);

			expect(typeof response.body.uptime).toBe("number");
			expect(response.body.uptime).toBeGreaterThan(0);
		});

		it("should include environment information", async () => {
			const response = await request(app).get("/health").expect(200);

			expect(response.body.environment).toBeDefined();
			expect(typeof response.body.environment).toBe("string");
		});
	});

	describe("GET /ready", () => {
		it("should return ready status when services are available", async () => {
			const response = await request(app).get("/ready").expect(200);

			expect(response.body.ready).toBe(true);
			expect(response.body.mongodb).toBe("ready");
			expect(response.body.redis).toBe("ready");
		});

		it("should check both MongoDB and Redis readiness", async () => {
			const response = await request(app).get("/ready").expect(200);

			expect(response.body).toHaveProperty("mongodb");
			expect(response.body).toHaveProperty("redis");
		});
	});

	describe("GET /live", () => {
		it("should return alive status", async () => {
			const response = await request(app).get("/live").expect(200);

			expect(response.body.alive).toBe(true);
		});

		it("should include timestamp", async () => {
			const response = await request(app).get("/live").expect(200);

			expect(response.body.timestamp).toBeDefined();
			expect(typeof response.body.timestamp).toBe("string");
			// Verify it's a valid ISO timestamp
			expect(new Date(response.body.timestamp).toISOString()).toBe(
				response.body.timestamp,
			);
		});

		it("should always return 200 when process is running", async () => {
			const response = await request(app).get("/live").expect(200);

			expect(response.status).toBe(200);
		});
	});
});
