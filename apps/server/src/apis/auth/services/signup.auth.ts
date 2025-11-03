import signup from "../repository/signup.auth";
import type { typeResult } from "../types/signup.auth";

export const signupAuth = async ({
	name,
	email,
	password,
	requestId,
}: {
	name: string;
	email: string;
	password: string;
	requestId: string;
}): Promise<typeResult> => {
	try {
		const startTime = Date.now();
		console.log(`[${requestId}] Signup service started`, { name, email });

		// Call repository function
		const result = await signup({ name, email, password });

		const duration = Date.now() - startTime;
		console.log(`[${requestId}] Signup service completed in ${duration}ms`);

		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Signup service error:`, err.message);

		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to create user",
				statusCode: 500,
				requestId,
			},
		};
	}
};
