---
title: "CLI Commands"
description: Command-line interface for managing Coral packages.
---

# CLI Commands

The `@reallygoodwork/coral-core` package includes a CLI for managing Coral packages.

## Installation

The CLI is included with the package:

```bash
npm install @reallygoodwork/coral-core
```

Run commands with `npx coral` or add to your `package.json` scripts.

---

## `coral init <name>`

Initialize a new Coral package with the recommended directory structure.

```bash
coral init my-design-system
```

### Options

| Option | Description |
|--------|-------------|
| `-d, --dir <directory>` | Target directory (default: `.`) |

### Output Structure

```
my-design-system/
├── coral.config.json
├── components/
│   └── index.json
└── tokens/
    ├── index.json
    ├── primitives.tokens.json
    └── semantic.tokens.json
```

### Example

```bash
# Create in current directory
coral init my-design-system

# Create in specific directory
coral init @acme/components -d ./packages
```

---

## `coral validate [path]`

Validate a Coral package for errors and warnings.

```bash
coral validate ./my-design-system
coral validate --strict  # Treat warnings as errors
```

### Options

| Option | Description |
|--------|-------------|
| `--strict` | Treat warnings as errors |

### Validation Checks

- Missing token references
- Missing component references
- Invalid variant values
- Circular dependencies
- Required props validation
- Slot requirements

### Example Output

```
✓ Package is valid
  12 components
  3 token files
  0 errors, 2 warnings

Warnings:
  [unused-prop] Button: Prop "variant" is defined but never used
  [deprecated] Card: Using deprecated prop "outline"
```

---

## `coral build [path]`

Build package outputs.

```bash
coral build --target types  # Generate TypeScript declarations
coral build --target json   # Export normalized JSON
coral build -o ./dist       # Specify output directory
```

### Options

| Option | Description |
|--------|-------------|
| `-t, --target <target>` | Build target: `types`, `json` (default: `types`) |
| `-o, --outDir <dir>` | Output directory |

### Build Targets

#### `types`

Generates TypeScript declaration files for all components:

```typescript
// dist/types/Button.d.ts
export interface ButtonProps {
  label: string;
  intent?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export declare const Button: React.FC<ButtonProps>;
```

#### `json`

Exports normalized JSON with all references resolved:

```json
{
  "components": {
    "Button": { /* resolved component */ }
  },
  "tokens": { /* merged tokens */ }
}
```

---

## `coral add <type> <name>`

Add a new component scaffold to the package.

```bash
coral add component Button --category Actions
coral add component Card --element article --description "Card container"
```

### Options

| Option | Description |
|--------|-------------|
| `-c, --category <category>` | Component category |
| `-e, --element <element>` | Root element type (default: `div`) |
| `-d, --description <description>` | Component description |

### Generated Component

```json
{
  "$schema": "https://coral.design/schema.json",
  "name": "Button",
  "elementType": "button",
  "$meta": {
    "name": "Button",
    "version": "0.1.0",
    "status": "draft",
    "category": "Actions",
    "description": ""
  },
  "props": {},
  "events": {},
  "styles": {}
}
```

The command also updates `components/index.json` to include the new component.

---

## Configuration

The CLI reads configuration from `coral.config.json` in the package root:

```json
{
  "$schema": "https://coral.design/config.schema.json",
  "name": "@acme/design-system",
  "version": "1.0.0",
  "coral": {
    "specVersion": "1.0.0"
  },
  "tokens": {
    "entry": "./tokens/index.json"
  },
  "components": {
    "entry": "./components/index.json"
  }
}
```

See [Package System](/docs/packages/core/packages) for full configuration options.

---

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | Validation errors found |
| `2` | Configuration error |
| `3` | File system error |

---

## Programmatic Usage

All CLI functionality is available programmatically:

```typescript
import {
  loadPackage,
  validatePackage,
  writePackage,
  createComponentScaffold
} from '@reallygoodwork/coral-core'
import * as fs from 'fs/promises'

// Load and validate
const pkg = await loadPackage('./coral.config.json', {
  readFile: (path) => fs.readFile(path, 'utf-8')
})

const result = validatePackage(pkg)
if (!result.valid) {
  console.error(result.errors)
}

// Create new component
const button = createComponentScaffold('Button', {
  elementType: 'button',
  category: 'Actions'
})
```
