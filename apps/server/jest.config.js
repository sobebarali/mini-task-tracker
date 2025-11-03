export default {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
		"^@mini-task-tracker/db$": "<rootDir>/tests/helpers/__mocks__/db.ts",
	},
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				useESM: true,
			},
		],
	},
	setupFiles: ["<rootDir>/tests/helpers/setup-env.ts"],
	roots: ["<rootDir>/tests"],
	testMatch: ["**/*.test.ts"],
	collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 70,
			lines: 70,
			statements: 70,
		},
	},
	coverageDirectory: "coverage",
	testTimeout: 30000,
};
