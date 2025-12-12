module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
  moduleNameMapper: {
    "^@reallygoodwork/coral-core$": "<rootDir>/../core/src/index.ts",
    "^@reallygoodwork/coral-tw2css$": "<rootDir>/../tw2css/src/index.ts",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
};
