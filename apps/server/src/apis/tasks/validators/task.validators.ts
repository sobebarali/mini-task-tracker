import { TaskStatus } from "@mini-task-tracker/db";
import { z } from "zod";
import type { typeCreatePayload, typeUpdatePayload } from "../types/task.types";

export const createTaskSchema = z.object({
	title: z.string().min(1).max(500),
	description: z.string().max(2000).optional(),
	status: z.nativeEnum(TaskStatus).optional(),
	dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z
	.object({
		title: z.string().min(1).max(500).optional(),
		description: z.string().max(2000).optional(),
		status: z.nativeEnum(TaskStatus).optional(),
		dueDate: z.string().datetime().optional(),
	})
	.refine(
		(data) => {
			// Ensure at least one field is provided for update
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

export const validateCreatePayload = (
	data: unknown,
):
	| { success: true; data: typeCreatePayload }
	| { success: false; error: z.ZodError } => {
	const result = createTaskSchema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data as typeCreatePayload };
	}
	return { success: false, error: result.error };
};

export const validateUpdatePayload = (
	data: unknown,
):
	| { success: true; data: typeUpdatePayload }
	| { success: false; error: z.ZodError } => {
	const result = updateTaskSchema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data as typeUpdatePayload };
	}
	return { success: false, error: result.error };
};
