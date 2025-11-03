import { TaskStatus } from "@mini-task-tracker/db";
import { z } from "zod";
import type { typePayload } from "../types/list.task";

export const payloadSchema = z.object({
	status: z.nativeEnum(TaskStatus).optional(),
	dueDate: z.string().datetime("Invalid date format").optional(),
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
