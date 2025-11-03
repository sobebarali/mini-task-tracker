import type { TaskStatus } from "@mini-task-tracker/db";

export type typePayload = {
	taskId: string;
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
	code: "NOT_FOUND" | "UNAUTHORIZED" | "INTERNAL_ERROR";
	message: string;
	statusCode: 404 | 401 | 500;
	requestId: string;
};

export type typeResult = {
	data: null | typeResultData;
	error: null | typeResultError;
};
