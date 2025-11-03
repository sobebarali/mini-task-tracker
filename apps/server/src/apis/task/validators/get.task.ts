import { z } from "zod";
import type { typePayload } from "../types/get.task";

export const payloadSchema = z.object({
	taskId: z.string().min(1, "Task ID is required"),
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
