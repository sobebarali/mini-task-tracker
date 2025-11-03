import { z } from "zod";
import type { typePayload } from "../types/login.auth";

export const payloadSchema = z.object({
	email: z
		.string({ message: "Email is required" })
		.trim()
		.email({ message: "Invalid email format" })
		.min(3)
		.max(255)
		.transform((val) => val.toLowerCase()),
	password: z.string().min(1).max(255),
});

export const validatePayload = (
	data: unknown,
):
	| { success: true; data: typePayload }
	| { success: false; error: z.ZodError } => {
	const result = payloadSchema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data as typePayload };
	}
	return { success: false, error: result.error };
};
