import "dotenv/config";
import "@mini-task-tracker/db"; // Initialize database connections
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRoutes from "./apis/auth/auth.routes";
import taskRoutes from "./apis/task/task.routes";

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins =
	process.env.CORS_ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()) ||
	[];

if (process.env.NODE_ENV === "development") {
	allowedOrigins.push("http://localhost:3000", "http://localhost:3001");
}

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (mobile apps, Postman, etc.)
			if (!origin) {
				callback(null, true);
				return;
			}

			if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	}),
);

// Body parsing with size limits
app.use(express.json({ limit: "10kb" }));

// Rate limiting - General API limiter
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Max 100 requests per window per IP
	message: "Too many requests from this IP, please try again later",
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiting - Strict limiter for authentication endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Max 5 login/signup attempts per window per IP
	message: "Too many authentication attempts, please try again later",
	standardHeaders: true,
	legacyHeaders: false,
});

// Basic health check (no rate limiting)
app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

// Apply rate limiters
app.use("/api/auth", authLimiter); // Strict rate limiting for auth
app.use("/api/", generalLimiter); // General rate limiting for all other API routes

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
	console.log(`\n${signal} received. Starting graceful shutdown...`);

	// Stop accepting new connections
	server.close(async () => {
		console.log("HTTP server closed");

		try {
			// Close database connections
			const { db, redis } = await import("@mini-task-tracker/db");

			// Close MongoDB connection
			await db.close();
			console.log("MongoDB connection closed");

			// Close Redis connection
			redis.disconnect();
			console.log("Redis connection closed");

			console.log("Graceful shutdown completed");
			process.exit(0);
		} catch (error) {
			console.error("Error during graceful shutdown:", error);
			process.exit(1);
		}
	});

	// Force shutdown after 10 seconds
	setTimeout(() => {
		console.error("Forcefully shutting down after timeout (10 seconds)");
		process.exit(1);
	}, 10000);
};

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
	console.error("Uncaught Exception:", error);
	gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on(
	"unhandledRejection",
	(reason: unknown, promise: Promise<unknown>) => {
		console.error("Unhandled Rejection at:", promise, "reason:", reason);
		gracefulShutdown("unhandledRejection");
	},
);
