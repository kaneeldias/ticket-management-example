module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.ts"],
    globalSetup: "<rootDir>/__tests__/integration/setup.ts",
    globalTeardown: "<rootDir>/__tests__/integration/teardown.ts",
    transform: {
        "^.+\\.ts?$": "ts-jest",
    },
};
