import { describe, expect, it } from "@jest/globals";
import {
	createRequestLogger,
	logDebug,
	logHttp,
	logInfo,
} from "../../../src/utils/logger";

describe("Unit: Logger - Meta formatting and additional methods", () => {
	it("should log info with complex meta object", () => {
		const complexMeta = {
			userId: "123",
			action: "update",
			nested: { key: "value", count: 42 },
		};

		// Should not throw
		expect(() => logInfo("Test message", complexMeta)).not.toThrow();
	});

	it("should log info with empty meta", () => {
		expect(() => logInfo("Test message", {})).not.toThrow();
	});

	it("should call logDebug successfully", () => {
		const meta = { context: "test" };
		expect(() => logDebug("Debug message", meta)).not.toThrow();
	});

	it("should call logHttp successfully", () => {
		const meta = { method: "GET", url: "/api/tasks", statusCode: 200 };
		expect(() => logHttp("HTTP request", meta)).not.toThrow();
	});

	it("should call logHttp without meta", () => {
		expect(() => logHttp("HTTP request")).not.toThrow();
	});

	it("should create request logger with requestId", () => {
		const requestId = "test-request-id";
		const requestLogger = createRequestLogger(requestId);

		expect(() => requestLogger.info("Test info")).not.toThrow();
		expect(() => requestLogger.error("Test error", new Error("Test"))).not.toThrow();
		expect(() => requestLogger.warn("Test warn")).not.toThrow();
		expect(() => requestLogger.debug("Test debug")).not.toThrow();
	});

	it("should create request logger and call methods with meta", () => {
		const requestId = "test-request-id";
		const requestLogger = createRequestLogger(requestId);
		const meta = { additional: "data" };

		expect(() => requestLogger.info("Test info", meta)).not.toThrow();
		expect(() =>
			requestLogger.error("Test error", new Error("Test"), meta),
		).not.toThrow();
		expect(() => requestLogger.warn("Test warn", meta)).not.toThrow();
		expect(() => requestLogger.debug("Test debug", meta)).not.toThrow();
	});
});
