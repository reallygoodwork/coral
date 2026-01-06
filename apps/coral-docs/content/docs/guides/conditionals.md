---
title: "Conditional Rendering"
description: Learn how to conditionally render nodes and apply styles based on prop values.
---

# Conditional Rendering

Coral supports conditional rendering—showing, hiding, or styling nodes based on prop values using a powerful expression syntax.

## Basic Conditional

The simplest conditional checks if a prop is truthy:

```json
{
  "name": "LoadingSpinner",
  "elementType": "span",
  "conditional": { "$prop": "loading" },
  "textContent": "Loading..."
}
```

This node only renders when the `loading` prop is truthy.

## Expression Types

### Prop Reference

Check if a prop is truthy:

```json
{ "$prop": "isVisible" }
{ "$prop": "hasIcon" }
{ "$prop": "showLabel" }
```

### Negation

Invert a condition:

```json
{
  "$not": { "$prop": "loading" }
}
```

### Logical AND

All conditions must be true:

```json
{
  "$and": [
    { "$prop": "showIcon" },
    { "$not": { "$prop": "loading" } }
  ]
}
```

### Logical OR

At least one condition must be true:

```json
{
  "$or": [
    { "$prop": "showIcon" },
    { "$prop": "showLabel" }
  ]
}
```

### Equality

Check if a prop equals a specific value:

```json
{
  "$eq": [{ "$prop": "status" }, "success"]
}
```

### Inequality

Check if a prop does not equal a value:

```json
{
  "$ne": [{ "$prop": "status" }, "loading"]
}
```

## Complex Expressions

Combine operators for complex logic:

```json
{
  "conditional": {
    "$and": [
      { "$prop": "enabled" },
      { "$not": { "$prop": "loading" } },
      {
        "$or": [
          { "$eq": [{ "$prop": "size" }, "lg"] },
          { "$eq": [{ "$prop": "size" }, "xl"] }
        ]
      }
    ]
  }
}
```

This renders when: `enabled && !loading && (size === 'lg' || size === 'xl')`

## Conditional Behavior

Control what happens when a condition is false:

```json
{
  "conditional": { "$prop": "showDetails" },
  "conditionalBehavior": "hide"
}
```

### Behavior Options

| Value | Description |
|-------|-------------|
| `hide` | Remove from DOM (default) |
| `dim` | Reduce opacity to 50% |
| `outline` | Show dashed outline |

The `dim` and `outline` behaviors are useful for design tools to show hidden elements.

## Conditional Styles

Apply styles based on conditions without hiding the element:

```json
{
  "name": "StatusBadge",
  "elementType": "span",

  "styles": {
    "padding": "4px 8px",
    "borderRadius": "4px"
  },

  "conditionalStyles": [
    {
      "condition": { "$eq": [{ "$prop": "status" }, "success"] },
      "styles": { "backgroundColor": "#22c55e", "color": "#ffffff" }
    },
    {
      "condition": { "$eq": [{ "$prop": "status" }, "error"] },
      "styles": { "backgroundColor": "#ef4444", "color": "#ffffff" }
    },
    {
      "condition": { "$eq": [{ "$prop": "status" }, "warning"] },
      "styles": { "backgroundColor": "#f59e0b", "color": "#000000" }
    },
    {
      "condition": { "$prop": "disabled" },
      "styles": { "opacity": "0.5", "cursor": "not-allowed" }
    }
  ]
}
```

Multiple conditions can match—styles are merged in order.

## Real-World Examples

### Button with Loading State

```json
{
  "name": "Button",
  "elementType": "button",

  "props": {
    "label": { "type": "string", "required": true },
    "loading": { "type": "boolean", "default": false },
    "disabled": { "type": "boolean", "default": false }
  },

  "styles": {
    "display": "inline-flex",
    "alignItems": "center",
    "gap": "8px",
    "padding": "8px 16px"
  },

  "conditionalStyles": [
    {
      "condition": { "$prop": "loading" },
      "styles": { "cursor": "wait" }
    },
    {
      "condition": { "$prop": "disabled" },
      "styles": { "opacity": "0.5", "cursor": "not-allowed" }
    }
  ],

  "children": [
    {
      "name": "Spinner",
      "elementType": "span",
      "conditional": { "$prop": "loading" },
      "styles": {
        "width": "16px",
        "height": "16px",
        "border": "2px solid currentColor",
        "borderTopColor": "transparent",
        "borderRadius": "50%",
        "animation": "spin 0.6s linear infinite"
      }
    },
    {
      "name": "Label",
      "elementType": "span",
      "textContent": { "$prop": "label" }
    }
  ]
}
```

### Form Field with Validation

```json
{
  "name": "TextField",
  "elementType": "div",

  "props": {
    "label": { "type": "string", "required": true },
    "error": { "type": "string" },
    "required": { "type": "boolean", "default": false }
  },

  "children": [
    {
      "name": "LabelWrapper",
      "elementType": "label",
      "children": [
        {
          "name": "LabelText",
          "elementType": "span",
          "textContent": { "$prop": "label" }
        },
        {
          "name": "RequiredIndicator",
          "elementType": "span",
          "conditional": { "$prop": "required" },
          "textContent": " *",
          "styles": { "color": "#ef4444" }
        }
      ]
    },
    {
      "name": "Input",
      "elementType": "input",
      "conditionalStyles": [
        {
          "condition": { "$prop": "error" },
          "styles": { "borderColor": "#ef4444" }
        }
      ]
    },
    {
      "name": "ErrorMessage",
      "elementType": "span",
      "conditional": { "$prop": "error" },
      "textContent": { "$prop": "error" },
      "styles": { "color": "#ef4444", "fontSize": "12px" }
    }
  ]
}
```

### Tabs Component

```json
{
  "name": "TabPanel",
  "elementType": "div",

  "props": {
    "value": { "type": "string", "required": true },
    "activeTab": { "type": "string", "required": true }
  },

  "conditional": {
    "$eq": [{ "$prop": "value" }, { "$prop": "activeTab" }]
  },

  "slots": [
    { "name": "default", "required": true }
  ],

  "children": [
    {
      "name": "Content",
      "elementType": "div",
      "slotTarget": "default"
    }
  ]
}
```

## Evaluating Conditions

Use the `evaluateCondition` function in code:

```typescript
import { evaluateCondition } from '@reallygoodwork/coral-core'

// Simple prop check
evaluateCondition(
  { $prop: 'loading' },
  { loading: true }
) // true

// Complex expression
evaluateCondition(
  {
    $and: [
      { $prop: 'enabled' },
      { $not: { $prop: 'loading' } },
      { $eq: [{ $prop: 'status' }, 'ready'] }
    ]
  },
  { enabled: true, loading: false, status: 'ready' }
) // true

// Equality with value
evaluateCondition(
  { $eq: [{ $prop: 'size' }, 'lg'] },
  { size: 'md' }
) // false
```

## Type Guards

```typescript
import { isConditionalExpression } from '@reallygoodwork/coral-core'

if (isConditionalExpression(node.conditional)) {
  const shouldRender = evaluateCondition(node.conditional, props)
}
```

## Combining with Variants

Conditionals work alongside variants:

```json
{
  "name": "AlertIcon",
  "elementType": "span",

  "conditional": { "$prop": "showIcon" },

  "variantStyles": {
    "intent": {
      "success": { "color": "#22c55e" },
      "error": { "color": "#ef4444" },
      "warning": { "color": "#f59e0b" }
    }
  }
}
```

## Best Practices

### 1. Keep Conditions Simple

Prefer simple conditions over deeply nested logic:

```json
// Good: Clear intent
{ "$prop": "loading" }

// Good: Simple combination
{ "$and": [{ "$prop": "visible" }, { "$not": { "$prop": "loading" } }] }

// Avoid: Deep nesting
{
  "$and": [
    { "$or": [
      { "$and": [{ "$prop": "a" }, { "$prop": "b" }] },
      { "$and": [{ "$prop": "c" }, { "$prop": "d" }] }
    ]},
    { "$not": { "$or": [{ "$prop": "e" }, { "$prop": "f" }] } }
  ]
}
```

### 2. Use Conditional Styles for Visual Changes

If you're just changing appearance, use `conditionalStyles` instead of hiding/showing:

```json
// Good: Conditional styles
{
  "conditionalStyles": [
    { "condition": { "$prop": "active" }, "styles": { "backgroundColor": "blue" } }
  ]
}

// Avoid: Duplicate nodes
{
  "children": [
    { "conditional": { "$prop": "active" }, "styles": { "backgroundColor": "blue" } },
    { "conditional": { "$not": { "$prop": "active" } }, "styles": { "backgroundColor": "gray" } }
  ]
}
```

### 3. Consider Fallback Content

For optional content, consider providing fallbacks:

```json
{
  "slotTarget": "icon",
  "slotFallback": [
    { "elementType": "span", "textContent": "→" }
  ],
  "conditional": {
    "$or": [
      { "$prop": "icon" },
      { "$prop": "showDefaultIcon" }
    ]
  }
}
```

### 4. Document Complex Conditions

Add descriptions for complex logic:

```json
{
  "name": "AdminPanel",
  "description": "Only shown for admin users who have completed onboarding",
  "conditional": {
    "$and": [
      { "$eq": [{ "$prop": "role" }, "admin"] },
      { "$prop": "onboardingComplete" }
    ]
  }
}
```

## Next Steps

- [Component Variants](/docs/packages/core/variants) - Add variants to components
- [Component Composition](/docs/packages/core/composition) - Embed components in components
- [Props & Events](/docs/packages/core/props-events) - Define typed APIs
- [API Reference](/docs/packages/core/conditionals) - Full conditionals API documentation
