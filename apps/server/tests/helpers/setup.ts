import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer | undefined;

/**
 * Setup test database before all tests
 */
export async function setupTestDB() {
	try {
		// Create in-memory MongoDB instance
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();

		// Connect to the in-memory database
		await mongoose.connect(mongoUri);
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

		// Stop the in-memory MongoDB instance
		if (mongoServer) {
			await mongoServer.stop();
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
