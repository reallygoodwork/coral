---
title: "Package System"
description: Organize design systems with coral.config.json manifests.
---

# Package System

The package system provides a standardized way to organize and distribute design systems.

## Package Manifest

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
      "typescript": true,
      "styling": "css-modules"
    }
  }
}
```

---

## Component Index

The component index (`components/index.json`) registers all components:

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
      "status": "stable"
    }
  ],
  "categories": [
    { "name": "Actions", "description": "Interactive components" },
    { "name": "Layout", "description": "Layout and container components" }
  ]
}
```

### Component Statuses

- `draft` - Work in progress
- `beta` - Ready for testing
- `stable` - Production-ready
- `deprecated` - Being phased out

---

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

1. **primitive** - Raw values (colors, spacing scales)
2. **semantic** - Purpose-based tokens referencing primitives
3. **component** - Component-specific tokens

---

## Loading Packages

```typescript
import { loadPackage, getComponent, hasComponent } from '@reallygoodwork/coral-core'
import * as fs from 'fs/promises'

const pkg = await loadPackage('./coral.config.json', {
  readFile: (path) => fs.readFile(path, 'utf-8'),
  resolveExtends: true,
})

console.log(`Package: ${pkg.config.name}`)
console.log(`Components: ${pkg.components.size}`)
console.log(`Token files: ${pkg.tokens.size}`)

// Access components
if (hasComponent(pkg, 'Button')) {
  const button = getComponent(pkg, 'Button')
}
```

---

## Validating Packages

```typescript
import { validatePackage, validateProps } from '@reallygoodwork/coral-core'

const result = validatePackage(pkg)

if (!result.valid) {
  for (const error of result.errors) {
    console.error(`[${error.type}] ${error.path}: ${error.message}`)
  }
}

// Also validate props
const propResult = validateProps(pkg)
for (const error of propResult.errors) {
  console.error(`Missing required prop: ${error.propName}`)
}
```

---

## Extending Packages

Packages can extend others to inherit tokens and components:

```json
{
  "name": "@acme/product-design-system",
  "extends": [
    "@acme/base-tokens@^1.0.0",
    "@acme/core-components@^2.0.0"
  ]
}
```

---

## Export Targets

Configure build outputs for different frameworks:

```json
{
  "exports": {
    "react": {
      "outDir": "./dist/react",
      "typescript": true,
      "styling": "tailwind",
      "fileCase": "PascalCase",
      "componentFormat": "function"
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
| `styled-components` | CSS-in-JS |
| `css-variables` | CSS custom properties |

---

## Related

### Guides
- [Package System Guide](/docs/guides/packages) - In-depth tutorial with examples
- [Getting Started Guide](/docs/guides/getting-started) - Quick start with packages
- [Component Composition Guide](/docs/guides/composition) - Components that reference each other

### API Documentation
- [CLI Commands](/docs/packages/core/cli) - Package management commands (`init`, `validate`, `build`, etc.)
- [References API](/docs/packages/core/references) - Token and component references
- [Component Variants API](/docs/packages/core/variants) - Variants in package components

### Transform Packages
- [Coral to React](/docs/packages/coral-to-react) - Generate React component libraries from packages
- [Coral to HTML](/docs/packages/coral-to-html) - Generate HTML from package components
