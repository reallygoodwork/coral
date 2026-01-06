---
title: Getting Started
description: Learn how to use Coral Libraries in your project.
---

## Installation

Install the packages you need from npm:

```bash
# Core package (required for all transformations)
npm install @reallygoodwork/coral-core

# Transform React to Coral specification
npm install @reallygoodwork/react-to-coral

# Generate React from Coral specification
npm install @reallygoodwork/coral-to-react

# Generate HTML from Coral specification
npm install @reallygoodwork/coral-to-html

# Tailwind CSS utilities
npm install @reallygoodwork/coral-tw2css
npm install @reallygoodwork/style-to-tailwind
```

## Creating a Design System Package

The recommended way to get started is using the CLI to create a package:

```bash
# Initialize a new package
npx @reallygoodwork/coral-core init my-design-system

# Navigate to the package
cd my-design-system

# Add your first component
npx coral add component Button --category Actions

# Validate your package
npx coral validate

# Build TypeScript types
npx coral build --target types
```

> **Learn more:** See the [Package System guide](/docs/guides/packages) for detailed information about organizing design systems, or check the [CLI documentation](/docs/packages/core/cli) for all available commands.

This creates a structured design system with:

```
my-design-system/
├── coral.config.json          # Package manifest
├── components/
│   ├── index.json             # Component registry
│   └── button/
│       └── button.coral.json  # Your button component
└── tokens/
    ├── index.json             # Token registry
    ├── primitives.tokens.json
    └── semantic.tokens.json
```

## Defining a Component with Variants

Here's how to create a button with variants. This example demonstrates variants, props, events, and state styles:

> **Learn more:** For comprehensive guides on these topics, see:
> - [Component Variants guide](/docs/guides/variants) - Deep dive into variant systems
> - [Props & Events guide](/docs/guides/props-events) - Typed component APIs
> - [Component Composition guide](/docs/guides/composition) - Embedding components within components

```json
{
  "$schema": "https://coral.design/schema.json",
  "name": "Button",
  "elementType": "button",

  "$meta": {
    "name": "Button",
    "version": "1.0.0",
    "status": "stable",
    "category": "Actions"
  },

  "componentVariants": {
    "axes": [
      {
        "name": "intent",
        "values": ["primary", "secondary", "destructive"],
        "default": "primary",
        "description": "Visual style of the button"
      },
      {
        "name": "size",
        "values": ["sm", "md", "lg"],
        "default": "md"
      }
    ]
  },

  "props": {
    "label": {
      "type": "string",
      "required": true,
      "description": "Button text"
    },
    "disabled": {
      "type": "boolean",
      "default": false
    }
  },

  "events": {
    "onClick": {
      "description": "Called when button is clicked",
      "parameters": [
        { "name": "event", "type": "React.MouseEvent<HTMLButtonElement>" }
      ]
    }
  },

  "styles": {
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "6px",
    "fontWeight": "500",
    "border": "none",
    "cursor": "pointer"
  },

  "variantStyles": {
    "intent": {
      "primary": { "backgroundColor": "#007bff", "color": "#ffffff" },
      "secondary": { "backgroundColor": "#6c757d", "color": "#ffffff" },
      "destructive": { "backgroundColor": "#dc3545", "color": "#ffffff" }
    },
    "size": {
      "sm": { "padding": "4px 8px", "fontSize": "12px" },
      "md": { "padding": "8px 16px", "fontSize": "14px" },
      "lg": { "padding": "12px 24px", "fontSize": "16px" }
    }
  },

  "stateStyles": {
    "hover": {
      "intent": {
        "primary": { "backgroundColor": "#0056b3" },
        "secondary": { "backgroundColor": "#5a6268" },
        "destructive": { "backgroundColor": "#c82333" }
      }
    },
    "disabled": {
      "opacity": "0.5",
      "cursor": "not-allowed"
    }
  },

  "textContent": { "$prop": "label" },

  "elementAttributes": {
    "type": "button",
    "disabled": { "$prop": "disabled" }
  },

  "eventHandlers": {
    "onClick": { "$event": "onClick" }
  }
}
```

## Quick Example: React → Coral → React

Transform a React component to a Coral specification and back:

```typescript
import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral'
import { coralToReact } from '@reallygoodwork/coral-to-react'

// Your React component as a string
const reactCode = `
export const Button = ({ label, onClick }) => {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onClick}>
      {label}
    </button>
  )
}
`

// Transform to Coral specification
const spec = transformReactComponentToSpec(reactCode)

// Generate React component from specification
const { reactCode: generatedCode, cssCode } = await coralToReact(spec, {
  componentFormat: 'arrow',
  styleFormat: 'inline',
})
```

## Quick Example: HTML → Coral

Transform HTML into a Coral specification:

```typescript
import { transformHTMLToSpec } from '@reallygoodwork/coral-core'

const html = `
<div class="container mx-auto">
  <h1 style="font-size: 24px; color: blue;">Hello World</h1>
  <p>Welcome to Coral</p>
</div>
`

const spec = transformHTMLToSpec(html)
```

## Quick Example: Coral → HTML

Generate HTML from a Coral specification:

```typescript
import { coralToHTML } from '@reallygoodwork/coral-to-html'

const spec = {
  elementType: 'div',
  styles: { padding: '20px', backgroundColor: '#f0f0f0' },
  children: [
    { elementType: 'h1', textContent: 'Hello World' }
  ]
}

const html = await coralToHTML(spec)
```

## Quick Example: Working with Variants

> **Learn more:** See the [Component Variants guide](/docs/guides/variants) for comprehensive information about variant systems, compound variants, and state styles.

```typescript
import {
  resolveNodeStyles,
  getVariantCombinations,
  generatePropsInterface
} from '@reallygoodwork/coral-core'

// Resolve styles for specific variant values
const styles = resolveNodeStyles(buttonSpec, {
  intent: 'primary',
  size: 'lg'
})

// Get all possible variant combinations
const combinations = getVariantCombinations([
  { name: 'intent', values: ['primary', 'secondary'] },
  { name: 'size', values: ['sm', 'md', 'lg'] }
])
// 6 combinations: primary-sm, primary-md, primary-lg, secondary-sm, ...

// Generate TypeScript interface
const tsInterface = generatePropsInterface(buttonSpec)
// export interface ButtonProps {
//   intent?: "primary" | "secondary" | "destructive";
//   size?: "sm" | "md" | "lg";
//   label: string;
//   disabled?: boolean;
//   onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
// }
```

## Quick Example: Loading and Validating Packages

> **Learn more:** See the [Package System guide](/docs/guides/packages) for detailed information about package structure, validation, and extending packages.

```typescript
import { loadPackage, validatePackage } from '@reallygoodwork/coral-core'
import * as fs from 'fs/promises'

// Load a package
const pkg = await loadPackage('./my-design-system/coral.config.json', {
  readFile: (path) => fs.readFile(path, 'utf-8')
})

console.log(`Loaded ${pkg.components.size} components`)

// Validate the package
const result = validatePackage(pkg)
if (!result.valid) {
  for (const error of result.errors) {
    console.error(`[${error.type}] ${error.message}`)
  }
}
```

## Quick Example: Tailwind → CSS

Convert Tailwind classes to CSS style objects:

```typescript
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css'

const styles = tailwindToCSS('p-4 bg-blue-500 text-white rounded-lg')
// {
//   paddingInlineStart: '1rem',
//   paddingInlineEnd: '1rem',
//   paddingBlockStart: '1rem',
//   paddingBlockEnd: '1rem',
//   backgroundColor: '#3b82f6',
//   color: '#ffffff',
//   borderRadius: '0.5rem'
// }
```

## Development

To work on the monorepo locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/reallygoodwork/coral.git
   cd coral
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build all packages:
   ```bash
   pnpm build
   ```

4. Run tests:
   ```bash
   pnpm test
   ```

5. Run in development mode:
   ```bash
   pnpm dev
   ```

## Package Links

- [@reallygoodwork/coral-core](https://www.npmjs.com/package/@reallygoodwork/coral-core) - Core types, schemas, CLI, and utilities
- [@reallygoodwork/coral-tw2css](https://www.npmjs.com/package/@reallygoodwork/coral-tw2css) - Tailwind to CSS
- [@reallygoodwork/style-to-tailwind](https://www.npmjs.com/package/@reallygoodwork/style-to-tailwind) - CSS to Tailwind
- [@reallygoodwork/react-to-coral](https://www.npmjs.com/package/@reallygoodwork/react-to-coral) - React to Coral
- [@reallygoodwork/coral-to-react](https://www.npmjs.com/package/@reallygoodwork/coral-to-react) - Coral to React
- [@reallygoodwork/coral-to-html](https://www.npmjs.com/package/@reallygoodwork/coral-to-html) - Coral to HTML

## Next Steps

### Core Concepts
- [Component Variants](/docs/guides/variants) - Learn how to create flexible, multi-variant components
- [Props & Events](/docs/guides/props-events) - Define typed component APIs
- [Component Composition](/docs/guides/composition) - Embed components within components
- [Package System](/docs/guides/packages) - Organize and distribute design systems

### Package Documentation
- [Core Package](/docs/packages/core) - Core utilities, schemas, and CLI
- [Coral to React](/docs/packages/coral-to-react) - Generate React components from Coral specs
- [Coral to HTML](/docs/packages/coral-to-html) - Generate HTML from Coral specs
- [React to Coral](/docs/packages/react-to-coral) - Convert React components to Coral specs
