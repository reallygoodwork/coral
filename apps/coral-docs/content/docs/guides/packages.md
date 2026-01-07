---
title: "Package System"
description: Learn how to organize, distribute, and manage Coral design systems using the package system.
---

## Introduction

The Coral package system provides a standardized way to organize design systems. A package bundles components, tokens, and assets together with metadata and build configurations.

> **Related:** This guide covers package concepts in depth. For API reference, see [Package System API](/docs/packages/core/packages). For CLI commands, see [CLI documentation](/docs/packages/core/cli).

## Package Structure

A typical Coral package looks like this:

```
my-design-system/
├── coral.config.json          # Package manifest
├── components/
│   ├── index.json             # Component registry
│   ├── button/
│   │   └── button.coral.json
│   ├── card/
│   │   └── card.coral.json
│   └── input/
│       └── input.coral.json
├── tokens/
│   ├── index.json             # Token registry
│   ├── primitives.tokens.json
│   └── semantic.tokens.json
└── assets/
    └── icons/
        └── arrow.svg
```

## Creating a Package

### Using the CLI

The easiest way to create a package is with the CLI:

```bash
coral init my-design-system
cd my-design-system
```

This creates the basic structure with sensible defaults.

### Package Manifest

The `coral.config.json` file is the heart of your package:

```json
{
  "$schema": "https://coral.design/config.schema.json",
  "name": "@acme/design-system",
  "version": "1.0.0",
  "description": "ACME Corporate Design System",
  "coral": {
    "specVersion": "1.0.0"
  },
  "tokens": {
    "entry": "./tokens/index.json",
    "contexts": [
      { "name": "light", "default": true },
      { "name": "dark", "mediaQuery": "(prefers-color-scheme: dark)" }
    ]
  },
  "components": {
    "entry": "./components/index.json"
  },
  "assets": {
    "entry": "./assets"
  },
  "presets": {
    "cssReset": "./presets/reset.css",
    "globalStyles": "./presets/global.css"
  },
  "extends": ["@acme/base-tokens@^1.0.0"],
  "exports": {
    "react": {
      "outDir": "./dist/react",
      "typescript": true,
      "styling": "tailwind",
      "componentFormat": "function"
    },
    "vue": {
      "outDir": "./dist/vue",
      "styling": "css-modules"
    }
  }
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Package name (npm-style, e.g., `@org/name`) |
| `version` | string | Semver version |
| `description` | string | Human-readable description |
| `coral.specVersion` | string | Coral spec version this package targets |
| `tokens` | object | Token configuration |
| `components` | object | Component configuration |
| `assets` | object | Asset configuration |
| `presets` | object | CSS reset and global styles |
| `extends` | string[] | Packages to extend |
| `exports` | object | Build target configurations |

## Component Index

The component index (`components/index.json`) registers all components in your package:

```json
{
  "$schema": "https://coral.design/components-index.schema.json",
  "name": "ACME Components",
  "version": "1.0.0",
  "components": [
    {
      "name": "Button",
      "path": "./button/button.coral.json",
      "category": "Actions",
      "status": "stable",
      "tags": ["interactive", "form"]
    },
    {
      "name": "Card",
      "path": "./card/card.coral.json",
      "category": "Layout",
      "status": "stable",
      "tags": ["container"]
    },
    {
      "name": "TextField",
      "path": "./text-field/text-field.coral.json",
      "category": "Forms",
      "status": "beta",
      "tags": ["input", "form"]
    }
  ],
  "categories": [
    { "name": "Actions", "description": "Interactive components" },
    { "name": "Layout", "description": "Layout and containers" },
    { "name": "Forms", "description": "Form inputs and controls" }
  ]
}
```

### Component Statuses

- `draft` - Work in progress, not ready for use
- `beta` - Ready for testing, API may change
- `stable` - Production-ready
- `deprecated` - Being phased out

## Token Index

The token index (`tokens/index.json`) registers token files and contexts:

```json
{
  "$schema": "https://coral.design/tokens-index.schema.json",
  "name": "ACME Tokens",
  "version": "1.0.0",
  "sources": [
    { "path": "./primitives.tokens.json", "layer": "primitive" },
    { "path": "./semantic.tokens.json", "layer": "semantic" },
    { "path": "./component.tokens.json", "layer": "component" }
  ],
  "contexts": {
    "definitions": [
      { "name": "light", "default": true },
      { "name": "dark", "mediaQuery": "(prefers-color-scheme: dark)" }
    ],
    "dimensions": [
      { "name": "colorScheme", "values": ["light", "dark"] }
    ]
  }
}
```

### Token Layers

Token layers determine load order:

1. **primitive** - Raw values (colors, spacing scales)
2. **semantic** - Purpose-based tokens referencing primitives
3. **component** - Component-specific tokens

## Loading Packages

```typescript
import { loadPackage, getComponent } from '@reallygoodwork/coral-core'
import * as fs from 'fs/promises'

// Load package
const pkg = await loadPackage('./coral.config.json', {
  readFile: (path) => fs.readFile(path, 'utf-8'),
  resolveExtends: true,  // Load extended packages
})

// Access package info
console.log(`Package: ${pkg.config.name} v${pkg.config.version}`)
console.log(`Components: ${pkg.components.size}`)
console.log(`Token files: ${pkg.tokens.size}`)

// Get a specific component
const button = getComponent(pkg, 'Button')
if (button) {
  console.log(`Button has ${button.children?.length ?? 0} children`)
}

// List all components
for (const [name, component] of pkg.components) {
  console.log(`- ${name} (${component.$meta?.status ?? 'unknown'})`)
}
```

## Validating Packages

```typescript
import { validatePackage, validateProps } from '@reallygoodwork/coral-core'

// Validate structure and references
const result = validatePackage(pkg)

if (!result.valid) {
  console.log('Package has errors:')
  for (const error of result.errors) {
    console.log(`  [${error.type}] ${error.path}`)
    console.log(`    ${error.message}`)
  }
}

if (result.warnings.length > 0) {
  console.log('Warnings:')
  for (const warning of result.warnings) {
    console.log(`  [${warning.type}] ${warning.message}`)
  }
}

// Validate prop bindings
const propResult = validateProps(pkg)
for (const error of propResult.errors) {
  console.log(`  Missing required prop: ${error.propName}`)
}
```

### Error Types

- `missing-token` - Token reference not found
- `missing-component` - Component reference not found
- `missing-prop` - Prop used but not defined
- `circular-ref` - Circular component dependency
- `invalid-variant` - Invalid variant value

## Writing Packages

```typescript
import { writePackage, createComponentScaffold } from '@reallygoodwork/coral-core'
import * as fs from 'fs/promises'

// Create a new component
const button = createComponentScaffold('Button', {
  elementType: 'button',
  category: 'Actions',
  description: 'Primary action button'
})

// Write package to disk
await writePackage('./my-design-system', {
  config: {
    name: '@acme/design-system',
    version: '1.0.0',
    coral: { specVersion: '1.0.0' },
    tokens: { entry: './tokens/index.json' },
    components: { entry: './components/index.json' }
  },
  components: new Map([['Button', button]])
}, {
  writeFile: (path, content) => fs.writeFile(path, content, 'utf-8'),
  mkdir: (path) => fs.mkdir(path, { recursive: true })
})
```

## Extending Packages

Packages can extend other packages to inherit their tokens and components:

```json
{
  "name": "@acme/product-design-system",
  "version": "1.0.0",
  "extends": [
    "@acme/base-tokens@^1.0.0",
    "@acme/core-components@^2.0.0"
  ]
}
```

When loading, extended packages are merged:
- Tokens from extended packages load first
- Local tokens override extended tokens
- Components merge (local overrides extended)

## Export Targets

Configure how your package builds for different frameworks:

```json
{
  "exports": {
    "react": {
      "outDir": "./dist/react",
      "typescript": true,
      "styling": "tailwind",
      "fileCase": "PascalCase",
      "componentFormat": "function"
    },
    "vue": {
      "outDir": "./dist/vue",
      "typescript": true,
      "styling": "css-modules"
    },
    "html": {
      "outDir": "./dist/html",
      "styling": "inline"
    }
  }
}
```

### Styling Options

| Value | Description |
|-------|-------------|
| `inline` | Inline style attributes |
| `css-modules` | CSS Modules with hashed classes |
| `tailwind` | Tailwind utility classes |
| `styled-components` | CSS-in-JS with styled-components |
| `css-variables` | CSS custom properties |

### Building

```bash
# Build default target
coral build

# Build specific target
coral build --target react

# Custom output directory
coral build --target react -o ./custom-dist
```

## CLI Reference

### `coral init <name>`

Create a new package.

```bash
coral init my-design-system
coral init @acme/components -d ./packages
```

Options:
- `-d, --dir <directory>` - Target directory (default: `.`)

### `coral validate [path]`

Validate a package.

```bash
coral validate
coral validate ./packages/core
coral validate --strict
```

Options:
- `--strict` - Treat warnings as errors

### `coral build [path]`

Build package outputs.

```bash
coral build
coral build --target types
coral build --target json -o ./dist
```

Options:
- `-t, --target <target>` - Build target (default: `types`)
- `-o, --outDir <dir>` - Output directory

### `coral add <type> <name>`

Add a component to the package.

```bash
coral add component Button
coral add component Card --category Layout
coral add component Input --element input --description "Text input field"
```

Options:
- `-c, --category <category>` - Component category
- `-e, --element <element>` - Root element type (default: `div`)
- `-d, --description <description>` - Component description

## Best Practices

### 1. Use Scoped Names

```json
// Good
{ "name": "@acme/design-system" }

// Avoid
{ "name": "design-system" }
```

### 2. Version Semantically

Follow semver:
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### 3. Organize by Category

Group related components:

```
components/
├── actions/
│   ├── button/
│   ├── icon-button/
│   └── link/
├── forms/
│   ├── input/
│   ├── select/
│   └── checkbox/
└── layout/
    ├── card/
    ├── container/
    └── grid/
```

### 4. Use Status Appropriately

```json
{
  "status": "draft"      // Still designing
  "status": "beta"       // Ready for feedback
  "status": "stable"     // Production-ready
  "status": "deprecated" // Being removed
}
```

### 5. Document with Tags

```json
{
  "tags": ["interactive", "form", "accessible", "animated"]
}
```

### 6. Validate Before Publishing

```bash
coral validate --strict
# Exit code 0 = ready to publish
```

## Next Steps

### Related Guides
- [Component Variants](/docs/guides/variants) - Add variants to components in your package
- [Component Composition](/docs/guides/composition) - Compose components that reference each other
- [Props & Events](/docs/guides/props-events) - Define typed APIs for package components

### API Documentation
- [Package System API](/docs/packages/core/packages) - Full package API reference
- [CLI Commands](/docs/packages/core/cli) - Package management commands (`init`, `validate`, `build`, etc.)
- [References](/docs/packages/core/references) - Token and prop references

### Transform Packages
- [Coral to React](/docs/packages/coral-to-react) - Generate React component libraries from packages
- [Coral to HTML](/docs/packages/coral-to-html) - Generate HTML from package components
