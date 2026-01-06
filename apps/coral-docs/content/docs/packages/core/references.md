---
title: "Reference Types"
description: Token, prop, asset, and component references.
---

# Reference Types

Coral uses reference types to connect values to tokens, props, assets, and other components.

## Token References

Reference design tokens in styles:

```json
{
  "styles": {
    "backgroundColor": { "$token": "color.primary.500" },
    "padding": { "$token": "spacing.md", "$fallback": "16px" },
    "borderRadius": { "$token": "radius.md" }
  }
}
```

### With Fallback

```json
{ "$token": "color.brand.500", "$fallback": "#007bff" }
```

---

## Prop References

Reference component props:

```json
{
  "textContent": { "$prop": "label" },
  "elementAttributes": {
    "aria-label": { "$prop": "ariaLabel" },
    "disabled": { "$prop": "disabled" }
  }
}
```

---

## Prop Transforms

Transform prop values:

```json
{
  "elementAttributes": {
    "aria-expanded": { "$prop": "isOpen", "$transform": "boolean" },
    "aria-disabled": { "$prop": "enabled", "$transform": "not" }
  }
}
```

### Available Transforms

| Transform | Description |
|-----------|-------------|
| `boolean` | Convert to boolean |
| `not` | Negate boolean |
| `string` | Convert to string |
| `number` | Convert to number |

---

## Computed Values

Compute values from multiple inputs:

### Concatenation

```json
{
  "textContent": {
    "$computed": "concat",
    "$inputs": [{ "$prop": "firstName" }, " ", { "$prop": "lastName" }]
  }
}
```

### Ternary

```json
{
  "textContent": {
    "$computed": "ternary",
    "$inputs": [
      { "$prop": "loading" },
      "Loading...",
      { "$prop": "label" }
    ]
  }
}
```

---

## Component References

Reference other components:

```json
{
  "type": "COMPONENT_INSTANCE",
  "$component": {
    "ref": "./button/button.coral.json",
    "version": "^1.0.0"
  }
}
```

### Package References

```json
{
  "$component": {
    "ref": "@acme/design-system/Button",
    "version": "^2.0.0"
  }
}
```

---

## Asset References

Reference assets:

```json
{
  "$asset": "icons/arrow.svg",
  "$fallback": "→"
}
```

---

## External References

Reference external URLs:

```json
{
  "$external": "https://example.com/icon.svg"
}
```

---

## Reference Resolution

```typescript
import { createReferenceResolver, resolveStyleReferences } from '@reallygoodwork/coral-core'

const resolver = createReferenceResolver(pkg, { tokenContext: 'dark' })

// Resolve a single token
const color = resolver.resolveToken({ $token: 'color.primary.500' })

// Resolve all references in styles
const resolvedStyles = resolveStyleReferences(
  node.styles,
  resolver,
  { label: 'Click me' }
)
```

---

## Type Guards

```typescript
import {
  isTokenReference,
  isPropReference,
  isComponentReference,
  isAssetReference,
  isExternalReference,
  isAnyReference,
} from '@reallygoodwork/coral-core'

if (isTokenReference(value)) {
  console.log(`Token path: ${value.$token}`)
}

if (isPropReference(value)) {
  console.log(`Prop name: ${value.$prop}`)
}
```

---

## Collecting References

```typescript
import { collectTokenReferences, collectPropReferences } from '@reallygoodwork/coral-core'

// Find all token references in a component
const tokenRefs = collectTokenReferences(component)
// ['color.primary.500', 'spacing.md', 'radius.md']

// Find all prop references
const propRefs = collectPropReferences(component)
// ['label', 'disabled', 'loading']
```

---

## Related

- [Package System](/docs/packages/core/packages) - Token organization
- [Props & Events](/docs/packages/core/props-events) - Prop definitions
- [Composition](/docs/packages/core/composition) - Component references
