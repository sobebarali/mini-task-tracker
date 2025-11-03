import type { TaskStatus } from "@mini-task-tracker/db";

// Create Task
export type typeCreatePayload = {
	title: string;
	description?: string;
	status?: TaskStatus;
	dueDate?: string;
};

export type typeTaskData = {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	dueDate?: string;
	owner: string;
	createdAt: string;
};

export type typeCreateResultData = typeTaskData;

// Get Tasks
export type typeGetTasksFilters = {
	status?: TaskStatus;
	dueDate?: string;
};

export type typeGetTasksResultData = {
	tasks: typeTaskData[];
	total: number;
};

// Update Task
export type typeUpdatePayload = {
	title?: string;
	description?: string;
	status?: TaskStatus;
	dueDate?: string;
};

export type typeUpdateResultData = typeTaskData;

// Delete Task
export type typeDeleteResultData = {
	message: string;
};

// Common Error
export type typeResultError = {
	code: "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "INTERNAL_ERROR";
	message: string;
	statusCode: 400 | 404 | 401 | 500;
	requestId: string;
	field?: string;
};

// Result Types
export type typeCreateResult = {
	data: null | typeCreateResultData;
	error: null | typeResultError;
};

export type typeGetTasksResult = {
	data: null | typeGetTasksResultData;
	error: null | typeResultError;
};

export type typeUpdateResult = {
	data: null | typeUpdateResultData;
	error: null | typeResultError;
};

export type typeDeleteResult = {
	data: null | typeDeleteResultData;
	error: null | typeResultError;
};
