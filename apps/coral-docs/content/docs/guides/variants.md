---
title: "Component Variants"
description: Learn how to create flexible, multi-variant components using Coral's CVA-style variant system.
---

# Component Variants

Coral's variant system allows you to define component-level variants with per-node style responses—similar to [class-variance-authority (CVA)](https://cva.style/) but built into the specification format.

> **Related:** This guide covers variant concepts in depth. For API reference, see [Component Variants API](/docs/packages/core/variants). For examples of variants in generated React components, see [Coral to React](/docs/packages/coral-to-react).

## Why Variants?

Variants are essential for building design systems. Instead of creating separate components for each visual style, you define a single component with configurable variations:

- **Intent variants**: primary, secondary, destructive, ghost
- **Size variants**: sm, md, lg, xl
- **State variants**: default, error, success, warning

## Basic Example

Here's a simple button with intent and size variants:

```json
{
  "name": "Button",
  "elementType": "button",

  "componentVariants": {
    "axes": [
      {
        "name": "intent",
        "values": ["primary", "secondary", "destructive"],
        "default": "primary"
      },
      {
        "name": "size",
        "values": ["sm", "md", "lg"],
        "default": "md"
      }
    ]
  },

  "styles": {
    "display": "inline-flex",
    "borderRadius": "6px",
    "fontWeight": "500"
  },

  "variantStyles": {
    "intent": {
      "primary": { "backgroundColor": "#007bff", "color": "#fff" },
      "secondary": { "backgroundColor": "#6c757d", "color": "#fff" },
      "destructive": { "backgroundColor": "#dc3545", "color": "#fff" }
    },
    "size": {
      "sm": { "padding": "4px 8px", "fontSize": "12px" },
      "md": { "padding": "8px 16px", "fontSize": "14px" },
      "lg": { "padding": "12px 24px", "fontSize": "16px" }
    }
  }
}
```

## How Variant Resolution Works

When a component is rendered with specific variant values, styles are merged in order:

1. **Base styles** - Always applied
2. **Variant styles** - Applied based on active variant values
3. **Compound styles** - Applied when multiple variant conditions match
4. **Conditional styles** - Applied based on prop conditions

```typescript
import { resolveNodeStyles } from '@reallygoodwork/coral-core'

const styles = resolveNodeStyles(buttonNode, { intent: 'primary', size: 'lg' })

// Result:
// {
//   display: 'inline-flex',      // from base styles
//   borderRadius: '6px',         // from base styles
//   fontWeight: '500',           // from base styles
//   backgroundColor: '#007bff',  // from intent: primary
//   color: '#fff',               // from intent: primary
//   padding: '12px 24px',        // from size: lg
//   fontSize: '16px'             // from size: lg
// }
```

## Compound Variants

Sometimes specific combinations of variants need special handling. Compound variants let you define styles that apply only when multiple conditions are met:

```json
{
  "componentVariants": {
    "axes": [
      { "name": "intent", "values": ["primary", "destructive"], "default": "primary" },
      { "name": "size", "values": ["sm", "md", "lg"], "default": "md" }
    ],
    "compounds": [
      {
        "conditions": { "intent": "destructive", "size": "sm" },
        "description": "Small destructive buttons need extra visual emphasis"
      }
    ]
  },

  "compoundVariantStyles": [
    {
      "conditions": { "intent": "destructive", "size": "sm" },
      "styles": {
        "fontWeight": "bold",
        "border": "1px solid darkred"
      }
    }
  ]
}
```

## State Styles

State styles handle interactive states like hover, focus, and disabled. They can be simple or variant-aware:

### Simple State Styles

```json
{
  "stateStyles": {
    "hover": { "opacity": "0.9" },
    "focus": { "outline": "2px solid blue", "outlineOffset": "2px" },
    "active": { "transform": "scale(0.98)" },
    "disabled": { "opacity": "0.5", "cursor": "not-allowed" }
  }
}
```

### Variant-Aware State Styles

Different variants can have different hover effects:

```json
{
  "stateStyles": {
    "hover": {
      "intent": {
        "primary": { "backgroundColor": "#0056b3" },
        "secondary": { "backgroundColor": "#5a6268" },
        "destructive": { "backgroundColor": "#c82333" }
      }
    },
    "focus": {
      "intent": {
        "primary": { "outline": "2px solid #007bff" },
        "secondary": { "outline": "2px solid #6c757d" },
        "destructive": { "outline": "2px solid #dc3545" }
      }
    }
  }
}
```

## Per-Node Variant Responses

In complex components, different child nodes can respond to variants differently. Each node can define its own `variantStyles`:

```json
{
  "name": "Card",
  "elementType": "div",

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
      "styles": { "padding": "16px" },
      "variantStyles": {
        "variant": {
          "elevated": { "borderBottom": "none" },
          "outlined": { "borderBottom": "1px solid #e0e0e0" },
          "filled": { "borderBottom": "1px solid #e8e8e8" }
        }
      }
    },
    {
      "name": "Content",
      "elementType": "div",
      "styles": { "padding": "16px" }
    }
  ]
}
```

## Utility Functions

### Get All Variant Combinations

```typescript
import { getVariantCombinations } from '@reallygoodwork/coral-core'

const axes = [
  { name: 'intent', values: ['primary', 'secondary'] },
  { name: 'size', values: ['sm', 'md', 'lg'] }
]

const combinations = getVariantCombinations(axes)
// [
//   { intent: 'primary', size: 'sm' },
//   { intent: 'primary', size: 'md' },
//   { intent: 'primary', size: 'lg' },
//   { intent: 'secondary', size: 'sm' },
//   { intent: 'secondary', size: 'md' },
//   { intent: 'secondary', size: 'lg' }
// ]
```

### Get Default Values

```typescript
import { getDefaultVariantValues } from '@reallygoodwork/coral-core'

const axes = [
  { name: 'intent', values: ['primary', 'secondary'], default: 'primary' },
  { name: 'size', values: ['sm', 'md', 'lg'], default: 'md' }
]

const defaults = getDefaultVariantValues(axes)
// { intent: 'primary', size: 'md' }
```

### Validate Variant Values

```typescript
import { validateVariantValues } from '@reallygoodwork/coral-core'

const errors = validateVariantValues(
  { intent: 'invalid', size: 'md' },
  axes
)
// ['Invalid value "invalid" for axis "intent". Expected one of: primary, secondary']
```

### Generate CSS Class Names

```typescript
import { variantsToClassName } from '@reallygoodwork/coral-core'

const className = variantsToClassName({ intent: 'primary', size: 'lg' }, 'btn')
// 'btn-intent-primary btn-size-lg'
```

## Resolving Styles

### Single Node

```typescript
import { resolveNodeStyles, getAllNodeStyles } from '@reallygoodwork/coral-core'

// Get merged styles for current variants
const styles = resolveNodeStyles(node, { intent: 'primary', size: 'lg' })

// Get all styles including hover, focus, etc.
const allStyles = getAllNodeStyles(node, { intent: 'primary', size: 'lg' })
// {
//   base: { ... },
//   hover: { ... },
//   focus: { ... },
//   active: { ... },
//   disabled: { ... }
// }
```

### Full Tree

```typescript
import { resolveTreeStyles } from '@reallygoodwork/coral-core'

// Resolve styles for entire component tree
const styleMap = resolveTreeStyles(rootNode, { intent: 'primary', size: 'lg' })

// Map<nodeId, resolvedStyles>
for (const [nodeId, styles] of styleMap) {
  console.log(`${nodeId}:`, styles)
}
```

## Best Practices

### 1. Use Meaningful Axis Names

```json
// Good
{ "name": "intent", "values": ["primary", "secondary", "destructive"] }
{ "name": "size", "values": ["sm", "md", "lg"] }

// Avoid
{ "name": "type", "values": ["1", "2", "3"] }
{ "name": "s", "values": ["a", "b", "c"] }
```

### 2. Always Set Defaults

Every axis should have a sensible default value:

```json
{
  "name": "intent",
  "values": ["primary", "secondary", "destructive"],
  "default": "primary"  // Most common use case
}
```

### 3. Add Descriptions

Help consumers understand the purpose of each variant:

```json
{
  "name": "intent",
  "values": ["primary", "secondary", "destructive"],
  "default": "primary",
  "description": "Visual style indicating the button's purpose"
}
```

### 4. Use Compounds Sparingly

Compound variants add complexity. Use them only for genuine edge cases:

```json
// Good: Specific edge case
{
  "conditions": { "intent": "destructive", "size": "sm" },
  "styles": { "fontWeight": "bold" }
}

// Avoid: Could be handled differently
{
  "conditions": { "intent": "primary", "size": "md" },
  "styles": { ... }  // This is just the default case
}
```

### 5. Keep Variant Count Manageable

Too many variants make components hard to maintain:

```json
// Good: 4 intents × 3 sizes = 12 combinations
"axes": [
  { "name": "intent", "values": ["primary", "secondary", "destructive", "ghost"] },
  { "name": "size", "values": ["sm", "md", "lg"] }
]

// Avoid: 5 × 5 × 3 × 3 = 225 combinations!
"axes": [
  { "name": "intent", "values": [...5] },
  { "name": "size", "values": [...5] },
  { "name": "shape", "values": [...3] },
  { "name": "elevation", "values": [...3] }
]
```

## Next Steps

### Related Guides
- [Props & Events](/docs/guides/props-events) - Define typed component APIs that work with variants
- [Component Composition](/docs/guides/composition) - Embed components in components with variant overrides
- [Package System](/docs/guides/packages) - Organize components with variants into packages

### API Documentation
- [Component Variants API](/docs/packages/core/variants) - Full variants API reference
- [Conditional Rendering](/docs/packages/core/conditionals) - Show/hide based on props and variants
- [Coral to React](/docs/packages/coral-to-react) - Generate React components with CVA variant support
