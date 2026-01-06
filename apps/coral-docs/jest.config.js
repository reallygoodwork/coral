/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["__tests__/**/*.ts", "!__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@reallygoodwork/coral-core$": "<rootDir>/../../packages/core/src/index.ts",
    "^@reallygoodwork/coral-to-react$": "<rootDir>/../../packages/coral-to-react/src/index.ts",
    "^@reallygoodwork/coral-to-html$": "<rootDir>/../../packages/coral-to-html/src/index.ts",
    "^@reallygoodwork/react-to-coral$": "<rootDir>/../../packages/react-to-coral/src/index.ts",
    "^@reallygoodwork/coral-tw2css$": "<rootDir>/../../packages/tw2css/src/index.ts",
    "^@reallygoodwork/style-to-tailwind$": "<rootDir>/../../packages/style-to-tailwind/src/index.ts",
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
