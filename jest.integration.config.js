module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/__tests__/integration/**/*.test.ts"],
    globalSetup: "<rootDir>/__tests__/integration/setup.ts",
    globalTeardown: "<rootDir>/__tests__/integration/teardown.ts",
};
