import { createRequestLogger } from "../../../utils/logger";
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
	const logger = createRequestLogger(requestId);

	try {
		logger.info("Signup service started", { name, email });

		// Call repository function
		const result = await signup({ name, email, password });

		if (result.data) {
			logger.info("Signup service completed", {
				userId: result.data.userId,
				email,
			});
		}

		return result;
	} catch (error) {
		const err = error as Error;
		logger.error("Signup service error", err, { name, email });

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
