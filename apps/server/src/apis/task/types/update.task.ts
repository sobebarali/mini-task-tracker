import type { TaskStatus } from "@mini-task-tracker/db";

export type typePayload = {
	taskId: string;
	title?: string;
	description?: string;
	status?: TaskStatus;
	dueDate?: string;
};

export type typeResultData = {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	dueDate?: string;
	owner: string;
	createdAt: string;
};

export type typeResultError = {
	code: "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "INTERNAL_ERROR";
	message: string;
	statusCode: 400 | 404 | 401 | 500;
	requestId: string;
	field?: string;
};

export type typeResult = {
	data: null | typeResultData;
	error: null | typeResultError;
};
