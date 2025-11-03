import { TaskStatus } from "@mini-task-tracker/db";
import { z } from "zod";
import type { typePayload } from "../types/update.task";

export const payloadSchema = z
	.object({
		taskId: z.string().min(1, "Task ID is required"),
		title: z.string().min(1).max(500).optional(),
		description: z.string().max(2000).optional(),
		status: z.nativeEnum(TaskStatus).optional(),
		dueDate: z.string().datetime("Invalid date format").optional(),
	})
	.refine(
		(data) => {
			// Ensure at least one field is provided for update (excluding taskId)
			return (
				data.title !== undefined ||
				data.description !== undefined ||
				data.status !== undefined ||
				data.dueDate !== undefined
			);
		},
		{
			message: "At least one field must be provided for update",
		},
	);

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
