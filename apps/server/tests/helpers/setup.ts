import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer | undefined;

// Detect if running in Docker by checking for DATABASE_URL environment variable
const isDocker = !!process.env.DATABASE_URL;

/**
 * Setup test database before all tests
 */
export async function setupTestDB() {
	try {
		if (isDocker) {
			// Use real MongoDB in Docker
			const mongoUri = process.env.DATABASE_URL as string;
			console.log("🐳 Using Docker MongoDB for tests");
			await mongoose.connect(mongoUri);
		} else {
			// Use mongodb-memory-server for local development
			console.log("💻 Using mongodb-memory-server for tests");
			mongoServer = await MongoMemoryServer.create();
			const mongoUri = mongoServer.getUri();
			await mongoose.connect(mongoUri);
		}
		console.log("Test database connected");
	} catch (error) {
		console.error("Error setting up test database:", error);
		throw error;
	}
}

/**
 * Teardown test database after all tests
 */
export async function teardownTestDB() {
	try {
		// Disconnect from mongoose
		await mongoose.disconnect();

		// Only stop mongodb-memory-server if it was started (not in Docker)
		if (mongoServer) {
			await mongoServer.stop();
			mongoServer = undefined;
		}
		console.log("Test database disconnected");
	} catch (error) {
		console.error("Error tearing down test database:", error);
		throw error;
	}
}

/**
 * Clear all collections between tests
 */
export async function clearDatabase() {
	try {
		const collections = mongoose.connection.collections;

		for (const key in collections) {
			const collection = collections[key];
			if (collection) {
				await collection.deleteMany({});
			}
		}
	} catch (error) {
		console.error("Error clearing database:", error);
		throw error;
	}
}
