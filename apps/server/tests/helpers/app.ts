import cors from "cors";
import express from "express";
import authRoutes from "../../src/apis/auth/auth.routes";
import taskRoutes from "../../src/apis/tasks/tasks.routes";

// Create test app without database connection
export function createTestApp() {
	const app = express();

	app.use(
		cors({
			origin: "*",
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		}),
	);

	app.use(express.json());

	// Basic health check (no rate limiting)
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
			// Import database connections
			const { db, redis } = await import("@mini-task-tracker/db");

			// Check MongoDB connection
			const mongoStartTime = Date.now();
			try {
				// Mongoose readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
				if (db.readyState === 1) {
					// Ping database to verify connection
					await db.db?.admin().ping();
					healthCheck.services.mongodb.status = "healthy";
					healthCheck.services.mongodb.responseTime =
						Date.now() - mongoStartTime;
				} else {
					healthCheck.services.mongodb.status = "disconnected";
					healthCheck.status = "degraded";
				}
			} catch (mongoError) {
				healthCheck.services.mongodb.status = "unhealthy";
				healthCheck.status = "degraded";
				console.error("MongoDB health check failed:", mongoError);
			}

			// Check Redis connection
			const redisStartTime = Date.now();
			try {
				await redis.ping();
				healthCheck.services.redis.status = "healthy";
				healthCheck.services.redis.responseTime = Date.now() - redisStartTime;
			} catch (redisError) {
				healthCheck.services.redis.status = "unhealthy";
				healthCheck.status = "degraded";
				console.error("Redis health check failed:", redisError);
			}

			// Determine overall status
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

	// Readiness probe (for Kubernetes)
	app.get("/ready", async (_req, res) => {
		try {
			const { db, redis } = await import("@mini-task-tracker/db");

			// Check if both services are ready
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

	// Liveness probe (for Kubernetes)
	app.get("/live", (_req, res) => {
		// Simple check - is the process running?
		res.status(200).json({
			alive: true,
			timestamp: new Date().toISOString(),
		});
	});

	// API routes
	app.use("/api/auth", authRoutes);
	app.use("/api/tasks", taskRoutes);

	return app;
}
