import * as taskRepo from "../repository/task.repository";
import type {
	typeCreatePayload,
	typeCreateResult,
	typeDeleteResult,
	typeGetTasksFilters,
	typeGetTasksResult,
	typeUpdatePayload,
	typeUpdateResult,
} from "../types/task.types";

export const createTaskService = async (
	payload: typeCreatePayload,
	userId: string,
	requestId: string,
): Promise<typeCreateResult> => {
	try {
		console.log(`[${requestId}] Create task service started`);
		const result = await taskRepo.createTask(payload, userId);
		console.log(`[${requestId}] Create task service completed`);
		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Create task service error:`, err.message);
		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to create task",
				statusCode: 500,
				requestId,
			},
		};
	}
};

export const getTasksService = async (
	userId: string,
	requestId: string,
	filters: typeGetTasksFilters = {},
): Promise<typeGetTasksResult> => {
	try {
		console.log(
			`[${requestId}] Get tasks service started with filters:`,
			filters,
		);
		const result = await taskRepo.getTasks(userId, filters);
		console.log(`[${requestId}] Get tasks service completed`);
		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Get tasks service error:`, err.message);
		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to get tasks",
				statusCode: 500,
				requestId,
			},
		};
	}
};

export const updateTaskService = async (
	taskId: string,
	payload: typeUpdatePayload,
	userId: string,
	requestId: string,
): Promise<typeUpdateResult> => {
	try {
		console.log(`[${requestId}] Update task service started`);
		const result = await taskRepo.updateTask(taskId, payload, userId);
		console.log(`[${requestId}] Update task service completed`);
		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Update task service error:`, err.message);
		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to update task",
				statusCode: 500,
				requestId,
			},
		};
	}
};

export const deleteTaskService = async (
	taskId: string,
	userId: string,
	requestId: string,
): Promise<typeDeleteResult> => {
	try {
		console.log(`[${requestId}] Delete task service started`);
		const result = await taskRepo.deleteTask(taskId, userId);
		console.log(`[${requestId}] Delete task service completed`);
		return result;
	} catch (error) {
		const err = error as Error;
		console.error(`[${requestId}] Delete task service error:`, err.message);
		return {
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: err.message || "Failed to delete task",
				statusCode: 500,
				requestId,
			},
		};
	}
};
