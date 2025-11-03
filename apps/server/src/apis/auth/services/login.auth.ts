import { createRequestLogger } from "../../../utils/logger";
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
	const logger = createRequestLogger(requestId);

	try {
		logger.info("Login service started", { email });

		// Call repository function
		const result = await login({ email, password });

		if (result.data) {
			logger.info("Login service completed", {
				userId: result.data.userId,
				email,
			});
		} else {
			logger.warn("Login failed", {
				email,
				reason: result.error?.code || "UNKNOWN",
			});
		}

		return result;
	} catch (error) {
		const err = error as Error;
		logger.error("Login service error", err, { email });

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
