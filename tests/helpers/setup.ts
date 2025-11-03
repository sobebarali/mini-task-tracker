import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer | null = null;

// Detect if running in Docker by checking for DATABASE_URL environment variable
const isDocker = !!process.env.DATABASE_URL;

export const setupTestDB = async () => {
	if (isDocker) {
		// Use real MongoDB in Docker
		const mongoUri = process.env.DATABASE_URL as string;
		console.log("🐳 Using Docker MongoDB for tests:", mongoUri);
		await mongoose.connect(mongoUri);
	} else {
		// Use mongodb-memory-server for local development
		console.log("💻 Using mongodb-memory-server for tests");
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();
		await mongoose.connect(mongoUri);
	}
};

export const teardownTestDB = async () => {
	await mongoose.disconnect();

	// Only stop mongodb-memory-server if it was started
	if (mongoServer) {
		await mongoServer.stop();
		mongoServer = null;
	}
};

export const clearDatabase = async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		const collection = collections[key];
		if (collection) {
			await collection.deleteMany({});
		}
	}
};
