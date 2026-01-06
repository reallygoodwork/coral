---
title: "Conditional Rendering"
description: Expression-based conditional rendering and styling.
---

# Conditional Rendering

Use expressions to control rendering and styles based on prop values.

## Conditional Expressions

```json
{
  "children": [
    {
      "name": "LoadingSpinner",
      "elementType": "span",
      "conditional": { "$prop": "loading" }
    },
    {
      "name": "Icon",
      "elementType": "span",
      "conditional": {
        "$and": [
          { "$prop": "showIcon" },
          { "$not": { "$prop": "loading" } }
        ]
      }
    },
    {
      "name": "Badge",
      "elementType": "span",
      "conditional": {
        "$eq": [{ "$prop": "intent" }, "primary"]
      }
    }
  ]
}
```

---

## Expression Types

### Prop Reference

```json
{ "$prop": "isVisible" }
```

### Negation

```json
{ "$not": { "$prop": "loading" } }
```

### Logical AND

```json
{
  "$and": [
    { "$prop": "showIcon" },
    { "$not": { "$prop": "loading" } }
  ]
}
```

### Logical OR

```json
{
  "$or": [
    { "$prop": "showIcon" },
    { "$prop": "showLabel" }
  ]
}
```

### Equality

```json
{ "$eq": [{ "$prop": "status" }, "success"] }
```

### Inequality

```json
{ "$ne": [{ "$prop": "status" }, "loading"] }
```

---

## Conditional Behavior

Control what happens when condition is false:

```json
{
  "conditional": { "$prop": "showDetails" },
  "conditionalBehavior": "hide"
}
```

| Value | Description |
|-------|-------------|
| `hide` | Remove from DOM (default) |
| `dim` | Reduce opacity to 50% |
| `outline` | Show dashed outline |

---

## Conditional Styles

Apply styles based on conditions:

```json
{
  "conditionalStyles": [
    {
      "condition": { "$prop": "isActive" },
      "styles": { "backgroundColor": "#007bff", "color": "#ffffff" }
    },
    {
      "condition": { "$eq": [{ "$prop": "status" }, "error"] },
      "styles": { "borderColor": "#dc3545" }
    }
  ]
}
```

---

## Evaluating Conditions

```typescript
import { evaluateCondition } from '@reallygoodwork/coral-core'

// Simple prop check
evaluateCondition({ $prop: 'isVisible' }, { isVisible: true }) // true

// Negation
evaluateCondition({ $not: { $prop: 'loading' } }, { loading: false }) // true

// Complex expression
evaluateCondition(
  {
    $and: [
      { $prop: 'enabled' },
      { $not: { $prop: 'loading' } },
      { $or: [
        { $eq: [{ $prop: 'size' }, 'lg'] },
        { $eq: [{ $prop: 'size' }, 'xl'] }
      ]}
    ]
  },
  { enabled: true, loading: false, size: 'lg' }
) // true
```

---

## Type Guard

```typescript
import { isConditionalExpression } from '@reallygoodwork/coral-core'

if (isConditionalExpression(node.conditional)) {
  const shouldRender = evaluateCondition(node.conditional, props)
}
```

---

## Related

- [Guide: Conditionals](/docs/guides/conditionals) - In-depth tutorial
- [Props & Events](/docs/packages/core/props-events) - Prop definitions
- [Variants](/docs/packages/core/variants) - Variant-based styling
