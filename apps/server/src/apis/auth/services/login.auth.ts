import login from "../repository/login.auth";
import type { typeResult } from "../types/login.auth";

export const loginAuth = async ({
	email,
	password,
	requestId,
}: {
	email: string;
	password: string;
	requestId: string;
}): Promise<typeResult> => {
	try {
		const startTime = Date.now();
		console.log(`[${requestId}] Login service started`, { email });

		// Call repository function
		const result = await login({ email, password });

		const duration = Date.now() - startTime;
		console.log(`[${requestId}] Login service completed in ${duration}ms`);

		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Login service error:`, err.message);

		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to login",
				statusCode: 500,
				requestId,
			},
		};
	}
};
