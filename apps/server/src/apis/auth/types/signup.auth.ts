export type typePayload = {
	name: string;
	email: string;
	password: string;
};

export type typeResultData = {
	userId: string;
	name: string;
	email: string;
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
