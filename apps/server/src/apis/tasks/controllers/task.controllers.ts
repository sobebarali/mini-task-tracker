import { randomBytes } from "node:crypto";
import type { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth.middleware";
import * as taskService from "../services/task.services";
import {
	validateCreatePayload,
	validateGetTasksFilters,
	validateUpdatePayload,
} from "../validators/task.validators";

const validateAuthUser = (
	req: AuthRequest,
	res: Response,
	requestId: string,
): string | null => {
	const userId = req.user?.userId;
	if (!userId) {
		res.status(401).json({
			data: null,
			error: {
				code: "UNAUTHORIZED",
				message: "User not authenticated",
				statusCode: 401,
				requestId,
			},
		});
		return null;
	}
	return userId;
};

export const createTask = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	const requestId = randomBytes(16).toString("hex");

	try {
		const userId = validateAuthUser(req, res, requestId);
		if (!userId) return;

		const validation = validateCreatePayload(req.body);
		if (!validation.success) {
			res.status(400).json({
				data: null,
				error: {
					code: "VALIDATION_ERROR",
					message: validation.error.message,
					statusCode: 400,
					requestId,
				},
			});
			return;
		}

		const result = await taskService.createTaskService(
			validation.data,
			userId,
			requestId,
		);
		const statusCode = result.error ? result.error.statusCode || 500 : 201;
		res.status(statusCode).json(result);
	} catch (_error) {
		res.status(500).json({
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: "Failed to process request",
				statusCode: 500,
				requestId,
			},
		});
	}
};

export const getTasks = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	const requestId = randomBytes(16).toString("hex");

	try {
		const userId = validateAuthUser(req, res, requestId);
		if (!userId) return;

		// Validate query parameters
		const validation = validateGetTasksFilters(req.query);
		if (!validation.success) {
			res.status(400).json({
				data: null,
				error: {
					code: "VALIDATION_ERROR",
					message: validation.error.message,
					statusCode: 400,
					requestId,
				},
			});
			return;
		}

		const result = await taskService.getTasksService(
			userId,
			requestId,
			validation.data,
		);
		const statusCode = result.error ? result.error.statusCode || 500 : 200;
		res.status(statusCode).json(result);
	} catch (_error) {
		res.status(500).json({
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: "Failed to process request",
				statusCode: 500,
				requestId,
			},
		});
	}
};

export const updateTask = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	const requestId = randomBytes(16).toString("hex");

	try {
		const userId = validateAuthUser(req, res, requestId);
		if (!userId) return;

		const taskId = req.params.id;
		if (!taskId) {
			res.status(400).json({
				data: null,
				error: {
					code: "VALIDATION_ERROR",
					message: "Task ID is required",
					statusCode: 400,
					requestId,
				},
			});
			return;
		}

		const validation = validateUpdatePayload(req.body);
		if (!validation.success) {
			res.status(400).json({
				data: null,
				error: {
					code: "VALIDATION_ERROR",
					message: validation.error.message,
					statusCode: 400,
					requestId,
				},
			});
			return;
		}

		const result = await taskService.updateTaskService(
			taskId,
			validation.data,
			userId,
			requestId,
		);
		const statusCode = result.error ? result.error.statusCode || 500 : 200;
		res.status(statusCode).json(result);
	} catch (_error) {
		res.status(500).json({
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: "Failed to process request",
				statusCode: 500,
				requestId,
			},
		});
	}
};

export const deleteTask = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	const requestId = randomBytes(16).toString("hex");

	try {
		const userId = validateAuthUser(req, res, requestId);
		if (!userId) return;

		const taskId = req.params.id;
		if (!taskId) {
			res.status(400).json({
				data: null,
				error: {
					code: "VALIDATION_ERROR",
					message: "Task ID is required",
					statusCode: 400,
					requestId,
				},
			});
			return;
		}

		const result = await taskService.deleteTaskService(
			taskId,
			userId,
			requestId,
		);
		const statusCode = result.error ? result.error.statusCode || 500 : 200;
		res.status(statusCode).json(result);
	} catch (_error) {
		res.status(500).json({
			data: null,
			error: {
				code: "INTERNAL_ERROR",
				message: "Failed to process request",
				statusCode: 500,
				requestId,
			},
		});
	}
};
