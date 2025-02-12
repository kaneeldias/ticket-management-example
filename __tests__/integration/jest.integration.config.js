module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/__tests__/integration/**/*.test.ts"],
    globalSetup: "<rootDir>/setup.ts",
    globalTeardown: "<rootDir>/teardown.ts",
    transform: {
        "^.+\\.ts?$": "ts-jest",
    },
};
