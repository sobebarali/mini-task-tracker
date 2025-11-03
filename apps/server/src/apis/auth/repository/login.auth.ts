import { User } from "@mini-task-tracker/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logDebug, logInfo, logWarn } from "../../../utils/logger";
import type { typeResult } from "../types/login.auth";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
	throw new Error("JWT_SECRET must be set in environment variables");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export default async function login({
	email,
	password,
}: {
	email: string;
	password: string;
}): Promise<typeResult> {
	try {
		logDebug("Finding user by email", { email });

		// Find user by email (include password field for verification)
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			logWarn("Login failed - user not found", { email });
			return {
				data: null,
				error: {
					code: "UNAUTHORIZED",
					message: "Invalid email or password",
					statusCode: 401,
					requestId: "",
				},
			};
		}

		logDebug("Verifying password", { email, userId: String(user._id) });

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			logWarn("Login failed - invalid password", {
				email,
				userId: String(user._id),
			});
			return {
				data: null,
				error: {
					code: "UNAUTHORIZED",
					message: "Invalid email or password",
					statusCode: 401,
					requestId: "",
				},
			};
		}

		logDebug("Generating JWT token", {
			email,
			userId: String(user._id),
			expiresIn: JWT_EXPIRES_IN,
		});

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: String(user._id),
				email: user.email,
			},
			JWT_SECRET as string,
			{ expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
		);

		logInfo("User logged in successfully", {
			userId: String(user._id),
			email,
		});

		return {
			data: {
				token,
				userId: String(user._id),
				name: user.name,
				email: user.email,
			},
			error: null,
		};
	} catch (error) {
		throw new Error(
			`Database error: Failed to login: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
