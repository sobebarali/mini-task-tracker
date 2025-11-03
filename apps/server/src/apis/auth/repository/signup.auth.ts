import { User } from "@mini-task-tracker/db";
import bcrypt from "bcrypt";
import { logDebug, logInfo, logWarn } from "../../../utils/logger";
import type { typeResult } from "../types/signup.auth";

export default async function signup({
	name,
	email,
	password,
}: {
	name: string;
	email: string;
	password: string;
}): Promise<typeResult> {
	try {
		logDebug("Checking if user exists", { email });

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			logWarn("Signup failed - user already exists", { email });
			return {
				data: null,
				error: {
					code: "VALIDATION_ERROR",
					message: "User with this email already exists",
					statusCode: 400,
					requestId: "",
					field: "email",
				},
			};
		}

		logDebug("Hashing password", { email });

		// Hash password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		logDebug("Creating user in database", { email, name });

		// Create user
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
		});

		logInfo("User created successfully", {
			userId: String(user._id),
			email,
			name,
		});

		return {
			data: {
				userId: String(user._id),
				name: user.name,
				email: user.email,
			},
			error: null,
		};
	} catch (error) {
		throw new Error(
			`Database error: Failed to signup: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
