import Redis from "ioredis";
import mongoose from "mongoose";

// MongoDB connection
const DATABASE_URL = process.env.DATABASE_URL;
console.log("DATABASE_URL:", DATABASE_URL);
if (!DATABASE_URL) {
	console.error("DATABASE_URL environment variable is not set");
	throw new Error("DATABASE_URL is required");
}

console.log("Connecting to MongoDB...");
await mongoose.connect(DATABASE_URL).catch((error) => {
	console.log("Error connecting to database:", error);
	throw error;
});

console.log("MongoDB connected successfully");
const db = mongoose.connection;

// Redis connection
const redis = new Redis({
	host: process.env.REDIS_HOST || "localhost",
	port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
	retryStrategy: (times: number) => {
		const delay = Math.min(times * 50, 2000);
		return delay;
	},
	maxRetriesPerRequest: 3,
});

redis.on("error", (error: Error) => {
	console.log("Redis connection error:", error);
});

redis.on("connect", () => {
	console.log("Redis connected successfully");
});

export { type ITask, Task, TaskStatus } from "./models/task.model";
// Export models
export { type IUser, User } from "./models/user.model";

export { db, redis };
