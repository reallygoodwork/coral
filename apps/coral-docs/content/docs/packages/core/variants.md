---
title: "Component Variants"
description: CVA-style variant definitions with per-node style responses.
---

# Component Variants

The variants system allows you to define component-level variants (like [class-variance-authority](https://cva.style/)) with per-node style responses.

## Defining Variants

```typescript
import type { CoralRootNode } from '@reallygoodwork/coral-core'

const button: CoralRootNode = {
  name: 'Button',
  elementType: 'button',

  // Component-level variant definitions
  componentVariants: {
    axes: [
      {
        name: 'intent',
        values: ['primary', 'secondary', 'destructive', 'ghost'],
        default: 'primary',
        description: 'Visual style indicating button purpose',
      },
      {
        name: 'size',
        values: ['sm', 'md', 'lg'],
        default: 'md',
      },
    ],
    // Compound variants for edge cases
    compounds: [
      {
        conditions: { intent: 'destructive', size: 'sm' },
        description: 'Small destructive buttons need extra visual weight',
      },
    ],
  },

  // Base styles (always applied)
  styles: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 150ms ease',
  },

  // Per-node variant responses
  variantStyles: {
    intent: {
      primary: { backgroundColor: '#007bff', color: '#ffffff' },
      secondary: { backgroundColor: '#6c757d', color: '#ffffff' },
      destructive: { backgroundColor: '#dc3545', color: '#ffffff' },
      ghost: { backgroundColor: 'transparent', color: '#212529' },
    },
    size: {
      sm: { padding: '4px 8px', fontSize: '12px' },
      md: { padding: '8px 16px', fontSize: '14px' },
      lg: { padding: '12px 24px', fontSize: '16px' },
    },
  },

  // Compound variant styles
  compoundVariantStyles: [
    {
      conditions: { intent: 'destructive', size: 'sm' },
      styles: { fontWeight: 'bold' },
    },
  ],

  // State styles (hover, focus, disabled)
  stateStyles: {
    hover: {
      intent: {
        primary: { backgroundColor: '#0056b3' },
        secondary: { backgroundColor: '#5a6268' },
        destructive: { backgroundColor: '#c82333' },
        ghost: { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
      },
    },
    focus: {
      outline: '2px solid #007bff',
      outlineOffset: '2px',
    },
    disabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
}
```

---

## Resolving Variant Styles

```typescript
import { resolveNodeStyles, resolveTreeStyles } from '@reallygoodwork/coral-core'

// Resolve styles for a single node
const styles = resolveNodeStyles(buttonNode, { intent: 'primary', size: 'lg' })
// { display: 'inline-flex', backgroundColor: '#007bff', padding: '12px 24px', ... }

// Resolve styles for entire tree
const styleMap = resolveTreeStyles(rootNode, { intent: 'primary', size: 'md' })
// Map<nodeId, resolvedStyles>
```

---

## Utility Functions

```typescript
import {
  getVariantCombinations,
  getDefaultVariantValues,
  validateVariantValues,
  matchesCompoundCondition,
} from '@reallygoodwork/coral-core'

// Get all variant combinations
const combinations = getVariantCombinations([
  { name: 'intent', values: ['primary', 'secondary'] },
  { name: 'size', values: ['sm', 'md'] },
])
// [{ intent: 'primary', size: 'sm' }, { intent: 'primary', size: 'md' }, ...]

// Get defaults
const defaults = getDefaultVariantValues(axes)
// { intent: 'primary', size: 'md' }

// Validate values
const errors = validateVariantValues({ intent: 'invalid' }, axes)
// ['Invalid value "invalid" for axis "intent". Expected one of: primary, secondary']
```

---

## Variant Axis Schema

```typescript
type VariantAxis = {
  /** Axis name (e.g., "intent", "size") */
  name: string
  /** Possible values */
  values: string[]
  /** Default value */
  default: string
  /** Description for documentation */
  description?: string
}
```

---

## Per-Node Variant Responses

Different child nodes can respond to variants differently:

```json
{
  "name": "Card",
  "componentVariants": {
    "axes": [
      { "name": "variant", "values": ["elevated", "outlined", "filled"], "default": "elevated" }
    ]
  },
  "variantStyles": {
    "variant": {
      "elevated": { "boxShadow": "0 2px 8px rgba(0,0,0,0.1)" },
      "outlined": { "border": "1px solid #e0e0e0" },
      "filled": { "backgroundColor": "#f5f5f5" }
    }
  },
  "children": [
    {
      "name": "Header",
      "elementType": "div",
      "variantStyles": {
        "variant": {
          "elevated": { "borderBottom": "none" },
          "outlined": { "borderBottom": "1px solid #e0e0e0" },
          "filled": { "borderBottom": "1px solid #e8e8e8" }
        }
      }
    }
  ]
}
```

---

## State Styles

State styles handle interactive states and can be variant-aware:

### Simple State Styles

```json
{
  "stateStyles": {
    "hover": { "opacity": "0.9" },
    "focus": { "outline": "2px solid blue" },
    "active": { "transform": "scale(0.98)" },
    "disabled": { "opacity": "0.5", "cursor": "not-allowed" }
  }
}
```

### Variant-Aware State Styles

```json
{
  "stateStyles": {
    "hover": {
      "intent": {
        "primary": { "backgroundColor": "#0056b3" },
        "secondary": { "backgroundColor": "#5a6268" }
      }
    }
  }
}
```

---

## Compound Variants

Apply styles when multiple conditions match:

```json
{
  "compoundVariantStyles": [
    {
      "conditions": { "intent": "destructive", "size": "sm" },
      "styles": { "fontWeight": "bold", "border": "1px solid darkred" }
    }
  ]
}
```

---

## Related

### Guides
- [Component Variants Guide](/docs/guides/variants) - In-depth tutorial with examples
- [Props & Events Guide](/docs/guides/props-events) - Typed component APIs that work with variants
- [Component Composition Guide](/docs/guides/composition) - Variant overrides in component instances

### API Documentation
- [Props & Events API](/docs/packages/core/props-events) - Typed component APIs
- [Conditionals API](/docs/packages/core/conditionals) - Conditional rendering based on variants
- [Component Composition API](/docs/packages/core/composition) - Variant overrides in instances

### Transform Packages
- [Coral to React](/docs/packages/coral-to-react) - Generate React components with automatic CVA variant support

## React Generation with Variants

When generating React components, variants are automatically converted to CVA (Class Variance Authority) when using `styleFormat: 'className'`:

```typescript
import { coralToReact } from '@reallygoodwork/coral-to-react'

const { reactCode } = await coralToReact(buttonSpec, {
  styleFormat: 'className',
  // variantStrategy: 'cva' is auto-detected when variants exist
  includeTypes: true
})
```

The generator automatically:
- Converts variant styles to Tailwind classes
- Generates CVA configuration
- Adds variant axes to TypeScript props
- Handles compound variants
- Includes default variant values

See the [Coral to React documentation](/docs/packages/coral-to-react) for complete details on variant generation.
