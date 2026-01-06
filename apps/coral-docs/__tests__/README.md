# Documentation Examples Tests

This directory contains Jest tests that verify all code examples in the Coral documentation actually work and are not hallucinations.

## Running Tests

```bash
# Install dependencies first (if not already installed)
pnpm install

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test getting-started.test.ts
```

## Test Files

- **getting-started.test.ts** - Tests examples from the Getting Started guide
  - React → Coral → React transformation
  - HTML → Coral transformation
  - Coral → HTML generation
  - Working with variants
  - Loading and validating packages
  - Tailwind → CSS conversion
  - Complete button component example

- **variants-guide.test.ts** - Tests examples from the Component Variants guide
  - Variant resolution
  - Compound variants
  - State styles (simple and variant-aware)
  - Utility functions (getVariantCombinations, getDefaultVariantValues, etc.)
  - Per-node variant responses

- **composition-guide.test.ts** - Tests examples from the Component Composition guide
  - Component instances
  - Prop bindings (static, parent references, computed, transforms)
  - Event bindings
  - Variant overrides
  - Slots and slot bindings

- **package-examples.test.ts** - Tests examples from package documentation
  - coral-to-react basic example
  - coral-to-react component composition
  - coral-to-react with variants and CVA
  - coral-to-html basic example
  - coral-to-html component composition

## Purpose

These tests ensure that:
1. All code examples in documentation are syntactically correct
2. All imports and function calls work as documented
3. Examples produce expected outputs
4. No hallucinations or incorrect examples exist in the docs

## Adding New Tests

When adding new examples to documentation:
1. Extract the code example
2. Create a test case that verifies it works
3. Ensure the test passes before merging documentation changes
