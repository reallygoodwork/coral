# Test Setup Instructions

## Configuration Files Created

1. **`jest.config.js`** - Jest configuration for running tests
2. **`tsconfig.test.json`** - TypeScript configuration for tests (extends main tsconfig with CommonJS module)

## Installation

Before running tests, ensure dependencies are installed:

```bash
cd apps/coral-docs
pnpm install
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test getting-started.test.ts
```

## Test Coverage

The test suite verifies all code examples from:

- **Getting Started guide** (`getting-started.test.ts`)
- **Component Variants guide** (`variants-guide.test.ts`)
- **Component Composition guide** (`composition-guide.test.ts`)
- **Package documentation** (`package-examples.test.ts`)

## Troubleshooting

If you see errors about missing Jest modules:
1. Ensure `pnpm install` has been run
2. Check that `jest`, `ts-jest`, and `@types/jest` are in `devDependencies`
3. Try deleting `node_modules` and reinstalling: `rm -rf node_modules && pnpm install`

## Note

The Jest configuration uses module name mapping to import from workspace packages directly from their source files, so tests will use the latest code without needing to build packages first.
