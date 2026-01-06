---
title: "Component Composition"
description: Embed components within components with prop and slot bindings.
---

# Component Composition

Components can embed other components with prop, event, and slot bindings.

## Component Instance

```json
{
  "name": "CardAction",
  "type": "COMPONENT_INSTANCE",
  "$component": {
    "ref": "./button/button.coral.json",
    "version": "^1.0.0"
  },
  "propBindings": {
    "intent": "secondary",
    "disabled": { "$prop": "actionDisabled" },
    "label": { "$prop": "actionLabel" }
  },
  "eventBindings": {
    "onClick": { "$event": "onAction" }
  },
  "variantOverrides": {
    "size": "sm"
  }
}
```

---

## Component Reference

The `$component` field specifies which component to use:

```json
{
  "$component": {
    "ref": "./path/to/component.coral.json",
    "version": "^1.0.0"
  }
}
```

Reference components from other packages:

```json
{
  "$component": {
    "ref": "@acme/design-system/Button",
    "version": "^2.0.0"
  }
}
```

---

## Prop Bindings

### Static Values

```json
{
  "propBindings": {
    "label": "Click me",
    "intent": "primary",
    "disabled": false
  }
}
```

### Parent Prop References

```json
{
  "propBindings": {
    "label": { "$prop": "buttonLabel" },
    "disabled": { "$prop": "isDisabled" }
  }
}
```

### Computed Values

```json
{
  "propBindings": {
    "label": {
      "$computed": "ternary",
      "$inputs": [
        { "$prop": "loading" },
        "Loading...",
        { "$prop": "submitLabel" }
      ]
    }
  }
}
```

---

## Event Bindings

Forward events to parent:

```json
{
  "eventBindings": {
    "onClick": { "$event": "onButtonClick" },
    "onFocus": { "$event": "onButtonFocus" }
  }
}
```

Inline handlers:

```json
{
  "eventBindings": {
    "onClick": {
      "$inline": "() => setIsOpen(false)"
    }
  }
}
```

---

## Slot Definitions

Define where children can be inserted:

```json
{
  "name": "Card",
  "elementType": "div",
  "slots": [
    {
      "name": "default",
      "description": "Main content area",
      "required": true
    },
    {
      "name": "header",
      "description": "Card header",
      "allowedElements": ["h1", "h2", "h3", "h4"]
    },
    {
      "name": "actions",
      "description": "Action buttons",
      "allowedComponents": ["Button", "IconButton"],
      "multiple": true
    }
  ],
  "children": [
    {
      "name": "Header",
      "elementType": "div",
      "slotTarget": "header"
    },
    {
      "name": "Content",
      "elementType": "div",
      "slotTarget": "default"
    }
  ]
}
```

---

## Slot Bindings

```json
{
  "type": "COMPONENT_INSTANCE",
  "$component": { "ref": "./card/card.coral.json" },
  "slotBindings": {
    "header": { "$prop": "title" },
    "default": [
      { "elementType": "p", "textContent": "Card content" }
    ],
    "actions": { "$slot": "cardActions" }
  }
}
```

### Forward Slots

```json
{
  "slotBindings": {
    "header": { "$slot": "cardHeader" },
    "default": { "$slot": "cardContent" }
  }
}
```

---

## Variant & Style Overrides

```json
{
  "type": "COMPONENT_INSTANCE",
  "$component": { "ref": "./button/button.coral.json" },
  "variantOverrides": {
    "intent": "primary",
    "size": "sm"
  },
  "styleOverrides": {
    "marginTop": "16px",
    "width": "100%"
  }
}
```

---

## Utility Functions

```typescript
import {
  findComponentInstances,
  getInstanceDependencies,
  resolveComponentInstance,
  findCircularDependencies,
} from '@reallygoodwork/coral-core'

// Find all instances in a tree
const instances = findComponentInstances(rootNode)

// Get dependencies
const deps = getInstanceDependencies(component)
// ['./button/button.coral.json', './icon/icon.coral.json']

// Check for circular dependencies
const circles = findCircularDependencies(pkg)
if (circles.length > 0) {
  console.error('Circular dependencies found:', circles)
}
```

---

## Related

### Guides
- [Component Composition Guide](/docs/guides/composition) - In-depth tutorial with examples
- [Props & Events Guide](/docs/guides/props-events) - Typed APIs for component instances
- [Package System Guide](/docs/guides/packages) - Organizing components that reference each other

### API Documentation
- [Props & Events API](/docs/packages/core/props-events) - Typed APIs
- [Package System API](/docs/packages/core/packages) - Component organization
- [Component Variants API](/docs/packages/core/variants) - Variant overrides in instances

### Transform Packages
- [Coral to React](/docs/packages/coral-to-react) - Generate React components with composition support
- [Coral to HTML](/docs/packages/coral-to-html) - Generate HTML with flattened component instances
