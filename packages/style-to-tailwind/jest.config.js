module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts'],
  passWithNoTests: true,
  moduleNameMapper: {
    '^@reallygoodwork/coral-tw2css$': '<rootDir>/../tw2css/src/index.ts',
    '^@reallygoodwork/coral-core$': '<rootDir>/../core/src/index.ts',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
}
