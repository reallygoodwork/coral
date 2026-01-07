# @reallygoodwork/coral-core

Core types, schemas, utilities, and CLI for the Coral UI specification format.

[![npm](https://img.shields.io/npm/v/@reallygoodwork/coral-core)](https://www.npmjs.com/package/@reallygoodwork/coral-core)

## Installation

```bash
npm install @reallygoodwork/coral-core
# or
pnpm add @reallygoodwork/coral-core
# or
yarn add @reallygoodwork/coral-core
```

## Overview

This package provides the foundational types, Zod schemas, utility functions, and CLI tools for working with the Coral UI specification format. It's the core of the Coral ecosystem, enabling:

- **Component Variants System** - CVA-style variant definitions at the component level
- **Package System** - `coral.config.json` manifest for organizing design systems
- **Component Composition** - Embed components within components with prop/slot bindings
- **Typed Props & Events** - Full type definitions for component APIs
- **Conditional Rendering** - Expression-based conditional logic
- **Reference Resolution** - Token, prop, asset, and component references

## CLI Commands

The package includes a CLI for managing Coral packages:

```bash
# Initialize a new package
coral init my-design-system

# Validate a package
coral validate ./path/to/package

# Build outputs (types, json)
coral build --target types

# Add a new component
coral add component Button --category Actions
```

## Quick Start

### Creating a Component with Variants

```typescript
import type { CoralRootNode } from '@reallygoodwork/coral-core'

const button: CoralRootNode = {
  name: 'Button',
  elementType: 'button',

  // Component metadata
  $meta: {
    name: 'Button',
    version: '1.0.0',
    status: 'stable',
    category: 'Actions',
  },

  // Define variant axes
  componentVariants: {
    axes: [
      {
        name: 'intent',
        values: ['primary', 'secondary', 'destructive'],
        default: 'primary',
        description: 'Visual style of the button',
      },
      {
        name: 'size',
        values: ['sm', 'md', 'lg'],
        default: 'md',
      },
    ],
  },

  // Base styles
  styles: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: '500',
  },

  // Per-node variant responses
  variantStyles: {
    intent: {
      primary: { backgroundColor: '#007bff', color: '#ffffff' },
      secondary: { backgroundColor: '#6c757d', color: '#ffffff' },
      destructive: { backgroundColor: '#dc3545', color: '#ffffff' },
    },
    size: {
      sm: { padding: '4px 8px', fontSize: '12px' },
      md: { padding: '8px 16px', fontSize: '14px' },
      lg: { padding: '12px 24px', fontSize: '16px' },
    },
  },

  // State styles
  stateStyles: {
    hover: {
      intent: {
        primary: { backgroundColor: '#0056b3' },
        secondary: { backgroundColor: '#5a6268' },
        destructive: { backgroundColor: '#c82333' },
      },
    },
    disabled: { opacity: '0.5', cursor: 'not-allowed' },
  },

  // Typed props
  props: {
    label: {
      type: 'string',
      required: true,
      description: 'Button text',
    },
    disabled: {
      type: 'boolean',
      default: false,
    },
  },

  // Events
  events: {
    onClick: {
      description: 'Fired when button is clicked',
      parameters: [
        { name: 'event', type: 'React.MouseEvent<HTMLButtonElement>' },
      ],
    },
  },

  textContent: { $prop: 'label' },
}
```

### Package Manifest

Create a `coral.config.json` to organize your design system:

```json
{
  "$schema": "https://coral.design/config.schema.json",
  "name": "@acme/design-system",
  "version": "1.0.0",
  "description": "ACME Design System",
  "coral": { "specVersion": "1.0.0" },
  "tokens": { "entry": "./tokens/index.json" },
  "components": { "entry": "./components/index.json" },
  "exports": {
    "react": {
      "outDir": "./dist/react",
      "typescript": true,
      "styling": "tailwind"
    }
  }
}
```

## API Reference

### Core Functions

#### `parseUISpec(spec)`

Parses and validates a UI specification object against the Coral schema.

```typescript
import { parseUISpec } from '@reallygoodwork/coral-core'

const validatedSpec = await parseUISpec({
  name: 'Card',
  elementType: 'div',
  styles: { padding: '20px' },
})
```

#### `transformHTMLToSpec(html)`

Transforms an HTML string into a Coral specification.

```typescript
import { transformHTMLToSpec } from '@reallygoodwork/coral-core'

const spec = transformHTMLToSpec('<div class="card"><h1>Hello</h1></div>')
```

### Package System

#### `loadPackage(configPath, options)`

Load a Coral package from disk.

```typescript
import { loadPackage } from '@reallygoodwork/coral-core'
import * as fs from 'fs/promises'

const pkg = await loadPackage('./coral.config.json', {
  readFile: (path) => fs.readFile(path, 'utf-8'),
})

console.log(`Loaded ${pkg.components.size} components`)
```

#### `validatePackage(pkg)`

Validate all references in a package.

```typescript
import { validatePackage } from '@reallygoodwork/coral-core'

const result = validatePackage(pkg)
if (!result.valid) {
  console.error('Errors:', result.errors)
}
```

### Variant Resolution

#### `resolveNodeStyles(node, activeVariants)`

Resolve styles for a node with active variants.

```typescript
import { resolveNodeStyles } from '@reallygoodwork/coral-core'

const styles = resolveNodeStyles(buttonNode, {
  intent: 'primary',
  size: 'lg',
})
// Merges base styles with variant-specific overrides
```

#### `evaluateCondition(expression, props)`

Evaluate a conditional expression.

```typescript
import { evaluateCondition } from '@reallygoodwork/coral-core'

const isVisible = evaluateCondition(
  { $and: [{ $prop: 'enabled' }, { $not: { $prop: 'loading' } }] },
  { enabled: true, loading: false }
)
// true
```

### Type Generation

#### `generatePropsInterface(component)`

Generate TypeScript interface from component definition.

```typescript
import { generatePropsInterface } from '@reallygoodwork/coral-core'

const typeCode = generatePropsInterface(buttonComponent)
// export interface ButtonProps {
//   intent?: "primary" | "secondary" | "destructive";
//   ...
// }
```

## Type Guards

Coral Core provides comprehensive type guards for safe type narrowing without type assertions:

```typescript
import {
  isTokenReference,
  isPropReference,
  isComponentReference,
  isConditionalExpression,
  isComponentInstance,
} from '@reallygoodwork/coral-core'

// Check if a value is a token reference
if (isTokenReference(value)) {
  // value.$token is available - TypeScript knows this is TokenReference
}

// Check if a node is a component instance
if (isComponentInstance(node)) {
  // node.$component is available - TypeScript knows this is ComponentInstance
}
```

**Type Safety**: All type guards use proper type narrowing - no `as` assertions needed. The codebase is fully type-safe with zero `any` types.

## Type System

### Type Safety

Coral Core is fully type-safe with:
- **Zero `any` types** - All types are properly defined or use `unknown` with type guards
- **No type assertions** - Type guards provide safe type narrowing
- **Recursive types** - `CoralStyleType` is an interface supporting nested styles
- **Nullable types** - `CoralTSTypes` is `z.nullable` - returns `null` when type cannot be determined

### References

```typescript
type TokenReference = { $token: string; $fallback?: unknown }
type PropReference = { $prop: string }
type ComponentReference = {
  $component: { ref: string; version?: string }
  propBindings?: Record<string, unknown>
  slotBindings?: Record<string, unknown>
}
```

### TypeScript Types

```typescript
// CoralTSTypes is nullable - can be null when type cannot be determined
type CoralTSTypes =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | 'undefined'
  | 'function'
  | null

// CoralStyleType is an interface supporting recursive nested styles
interface CoralStyleType {
  [key: string]:
    | string
    | number
    | CoralColorType
    | CoralGradientType
    | Dimension
    | CoralStyleType  // Recursive for nested styles
}
```

### Variants

```typescript
type VariantAxis = {
  name: string
  values: string[]
  default: string
  description?: string
}

type ComponentVariants = {
  axes: VariantAxis[]
  compounds: CompoundVariantCondition[]
}
```

### Props & Events

```typescript
type ComponentPropDefinition = {
  type: PropType
  default?: unknown
  required?: boolean
  description?: string
  editorControl?: 'text' | 'select' | 'boolean' | 'color' | 'slider'
  constraints?: { min?: number; max?: number; pattern?: string }
}

type ComponentEventDefinition = {
  description?: string
  parameters: EventParameter[]
  deprecated?: boolean | string
}
```

### Conditional Expressions

```typescript
type ConditionalExpression =
  | { $prop: string }
  | { $not: ConditionalExpression }
  | { $and: ConditionalExpression[] }
  | { $or: ConditionalExpression[] }
  | { $eq: [ConditionalExpression, unknown] }
  | { $ne: [ConditionalExpression, unknown] }
```

## Extended CoralNode Fields

The `CoralNode` type now includes:

```typescript
// Variant styles
variantStyles?: NodeVariantStyles
compoundVariantStyles?: CompoundVariantStyle[]
stateStyles?: StateStyles

// Conditional rendering
conditional?: ConditionalExpression
conditionalBehavior?: 'hide' | 'dim' | 'outline'
conditionalStyles?: ConditionalStyle[]

// Slots
slotTarget?: string
slotFallback?: CoralNode[]

// Component instances
$component?: ComponentInstanceRef
propBindings?: Record<string, PropBinding>
eventBindings?: Record<string, EventBinding>
slotBindings?: Record<string, SlotBinding>
variantOverrides?: Record<string, string>

// Element bindings
eventHandlers?: Record<string, EventBinding>
ariaAttributes?: Record<string, BindableValue>
dataAttributes?: Record<string, BindableValue>
```

## Related Packages

- [@reallygoodwork/coral-tw2css](https://www.npmjs.com/package/@reallygoodwork/coral-tw2css) - Convert Tailwind to CSS
- [@reallygoodwork/react-to-coral](https://www.npmjs.com/package/@reallygoodwork/react-to-coral) - React to Coral
- [@reallygoodwork/coral-to-react](https://www.npmjs.com/package/@reallygoodwork/coral-to-react) - Coral to React
- [@reallygoodwork/coral-to-html](https://www.npmjs.com/package/@reallygoodwork/coral-to-html) - Coral to HTML

## License

MIT © [Really Good Work](https://reallygoodwork.com)
