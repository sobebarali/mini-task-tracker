import { User } from "@mini-task-tracker/db";
import bcrypt from "bcrypt";
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
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
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

		// Hash password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create user
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
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
