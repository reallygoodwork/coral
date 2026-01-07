---
title: "Component Composition"
description: Learn how to embed components within components using slots and prop bindings.
---

## Introduction

Coral supports powerful component composition—embedding components within other components, defining slots for content injection, and binding props and events across component boundaries.

> **Related:** This guide covers composition concepts in depth. For API reference, see [Component Composition API](/docs/packages/core/composition). For examples of composition in generated code, see [Coral to React](/docs/packages/coral-to-react) and [Coral to HTML](/docs/packages/coral-to-html).

## Component Instances

To embed one component inside another, use the `COMPONENT_INSTANCE` type:

```json
{
  "name": "AlertDialog",
  "elementType": "div",
  "children": [
    {
      "name": "CloseButton",
      "type": "COMPONENT_INSTANCE",
      "$component": {
        "ref": "./button/button.coral.json",
        "version": "^1.0.0"
      },
      "propBindings": {
        "label": "Close",
        "intent": "secondary",
        "size": "sm"
      },
      "eventBindings": {
        "onClick": { "$event": "onClose" }
      }
    }
  ]
}
```

### Component Reference

The `$component` field specifies which component to use:

```json
{
  "$component": {
    "ref": "./path/to/component.coral.json",  // Relative path
    "version": "^1.0.0"                        // Optional semver constraint
  }
}
```

You can also reference components from other packages:

```json
{
  "$component": {
    "ref": "@acme/design-system/Button",
    "version": "^2.0.0"
  }
}
```

## Prop Bindings

Prop bindings pass values to component instances. They can be:

### Static Values

```json
{
  "propBindings": {
    "label": "Click me",
    "intent": "primary",
    "size": "lg",
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

### Prop Transforms

```json
{
  "propBindings": {
    "aria-expanded": { "$prop": "isOpen", "$transform": "boolean" },
    "aria-disabled": { "$prop": "enabled", "$transform": "not" }
  }
}
```

## Event Bindings

Forward events from child components to parent:

```json
{
  "eventBindings": {
    "onClick": { "$event": "onButtonClick" },
    "onFocus": { "$event": "onButtonFocus" }
  }
}
```

### Inline Handlers

For simple operations, use inline handlers:

```json
{
  "eventBindings": {
    "onClick": {
      "$inline": "() => setIsOpen(false)"
    }
  }
}
```

## Variant Overrides

Override variant values for component instances:

```json
{
  "type": "COMPONENT_INSTANCE",
  "$component": { "ref": "./button/button.coral.json" },
  "propBindings": {
    "label": "Save"
  },
  "variantOverrides": {
    "intent": "primary",
    "size": "sm"
  }
}
```

## Style Overrides

Apply style overrides to component instance root:

```json
{
  "type": "COMPONENT_INSTANCE",
  "$component": { "ref": "./button/button.coral.json" },
  "styleOverrides": {
    "marginTop": "16px",
    "width": "100%"
  }
}
```

---

## Slots

Slots define where content can be inserted into a component.

### Defining Slots

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
      "description": "Card header content",
      "allowedElements": ["h1", "h2", "h3", "h4"]
    },
    {
      "name": "footer",
      "description": "Card footer content",
      "multiple": true
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
      "name": "HeaderWrapper",
      "elementType": "div",
      "slotTarget": "header",
      "styles": { "padding": "16px", "borderBottom": "1px solid #eee" }
    },
    {
      "name": "ContentWrapper",
      "elementType": "div",
      "slotTarget": "default",
      "styles": { "padding": "16px" }
    },
    {
      "name": "FooterWrapper",
      "elementType": "div",
      "slotTarget": "footer",
      "styles": { "padding": "16px", "borderTop": "1px solid #eee" }
    }
  ]
}
```

### Slot Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Slot identifier |
| `description` | string | Documentation |
| `required` | boolean | Must be provided |
| `multiple` | boolean | Accepts multiple children |
| `allowedElements` | string[] | Allowed HTML elements |
| `allowedComponents` | string[] | Allowed component types |
| `defaultContent` | object[] | Fallback content |

### Slot Targets

Mark where slot content renders with `slotTarget`:

```json
{
  "name": "HeaderSlot",
  "elementType": "div",
  "slotTarget": "header",
  "slotFallback": [
    { "elementType": "h2", "textContent": "Default Title" }
  ]
}
```

### Slot Bindings

When using a component with slots, bind content to them:

```json
{
  "type": "COMPONENT_INSTANCE",
  "$component": { "ref": "./card/card.coral.json" },
  "slotBindings": {
    "header": { "elementType": "h2", "textContent": "Card Title" },
    "default": [
      { "elementType": "p", "textContent": "Card content goes here." }
    ],
    "actions": [
      {
        "type": "COMPONENT_INSTANCE",
        "$component": { "ref": "./button/button.coral.json" },
        "propBindings": { "label": "Save" }
      }
    ]
  }
}
```

### Forwarding Slots

Forward parent slots to child components:

```json
{
  "slotBindings": {
    "header": { "$slot": "cardHeader" },
    "default": { "$slot": "cardContent" }
  }
}
```

---

## Component Sets

Group related components that share context:

```json
{
  "type": "COMPONENT_SET",
  "name": "Tabs",
  "members": [
    {
      "name": "TabsList",
      "role": "container",
      "path": "./tabs-list/tabs-list.coral.json"
    },
    {
      "name": "Tab",
      "role": "item",
      "path": "./tab/tab.coral.json"
    },
    {
      "name": "TabsContent",
      "role": "content",
      "path": "./tabs-content/tabs-content.coral.json"
    }
  ],
  "sharedContext": {
    "activeTab": {
      "type": "string",
      "description": "Currently active tab ID"
    }
  }
}
```

### Using Component Sets

```json
{
  "type": "COMPONENT_INSTANCE",
  "$component": { "ref": "./tabs/tabs.coral.json" },
  "slotBindings": {
    "tabs": [
      { "type": "COMPONENT_INSTANCE", "$component": { "ref": "./tabs/tab.coral.json" }, "propBindings": { "id": "tab1", "label": "First" } },
      { "type": "COMPONENT_INSTANCE", "$component": { "ref": "./tabs/tab.coral.json" }, "propBindings": { "id": "tab2", "label": "Second" } }
    ],
    "panels": [
      { "type": "COMPONENT_INSTANCE", "$component": { "ref": "./tabs/tabs-content.coral.json" }, "propBindings": { "tabId": "tab1" }, "slotBindings": { "default": [{ "elementType": "p", "textContent": "First panel" }] } },
      { "type": "COMPONENT_INSTANCE", "$component": { "ref": "./tabs/tabs-content.coral.json" }, "propBindings": { "tabId": "tab2" }, "slotBindings": { "default": [{ "elementType": "p", "textContent": "Second panel" }] } }
    ]
  }
}
```

---

## Utility Functions

### Find Component Instances

```typescript
import { findComponentInstances, getInstanceDependencies } from '@reallygoodwork/coral-core'

// Find all component instances in a tree
const instances = findComponentInstances(rootNode)
// [{ node, path: ['children', 0, 'children', 1] }, ...]

// Get dependencies for a component
const deps = getInstanceDependencies(component)
// ['./button/button.coral.json', './icon/icon.coral.json']
```

### Resolve Component Instance

```typescript
import { resolveComponentInstance } from '@reallygoodwork/coral-core'

const resolved = resolveComponentInstance(instanceNode, {
  getComponent: (ref) => pkg.components.get(ref),
  parentProps: { title: 'Hello' }
})
// Returns resolved component with merged props and bound events
```

### Validate Composition

```typescript
import { validateComposition, findCircularDependencies } from '@reallygoodwork/coral-core'

// Check for circular dependencies
const circles = findCircularDependencies(pkg)
if (circles.length > 0) {
  console.error('Circular dependencies found:', circles)
}

// Full composition validation
const result = validateComposition(pkg)
for (const error of result.errors) {
  console.error(`[${error.type}] ${error.message}`)
}
```

### Flatten Component Tree

```typescript
import { flattenComponentTree } from '@reallygoodwork/coral-core'

// Get flat list of all nodes (resolving instances)
const nodes = flattenComponentTree(rootNode, {
  getComponent: (ref) => pkg.components.get(ref)
})
```

---

## Best Practices

### 1. Define Clear Slot Contracts

Document what each slot expects:

```json
{
  "slots": [
    {
      "name": "trigger",
      "description": "Button or element that triggers the dropdown",
      "required": true,
      "allowedComponents": ["Button", "IconButton"]
    }
  ]
}
```

### 2. Use Default Slot Content

Provide sensible defaults:

```json
{
  "slotTarget": "icon",
  "slotFallback": [
    {
      "type": "COMPONENT_INSTANCE",
      "$component": { "ref": "./icon/icon.coral.json" },
      "propBindings": { "name": "chevron-down" }
    }
  ]
}
```

### 3. Keep Component Instances Shallow

Avoid deeply nested composition—prefer flatter structures:

```json
// Good: Flat structure with slots
{
  "type": "COMPONENT_INSTANCE",
  "$component": { "ref": "./dialog/dialog.coral.json" },
  "slotBindings": {
    "content": { "$slot": "dialogContent" }
  }
}

// Avoid: Deep nesting
{
  "children": [{
    "children": [{
      "children": [{
        "type": "COMPONENT_INSTANCE"
      }]
    }]
  }]
}
```

### 4. Validate Early

Use validation tools during development:

```bash
coral validate --strict
```

### 5. Document Prop Requirements

Clear documentation prevents integration errors:

```json
{
  "propBindings": {
    "onClose": { "$event": "onClose" }  // Required: Parent must handle onClose
  }
}
```

## Next Steps

### Related Guides
- [Component Variants](/docs/guides/variants) - Add variants to components that can be overridden in instances
- [Props & Events](/docs/guides/props-events) - Define typed props and events for component APIs
- [Package System](/docs/guides/packages) - Organize composed components into packages

### API Documentation
- [Component Composition API](/docs/packages/core/composition) - Full composition API reference
- [Conditional Rendering](/docs/packages/core/conditionals) - Show/hide based on props
- [Coral to React](/docs/packages/coral-to-react) - Generate React components with composition support
- [Coral to HTML](/docs/packages/coral-to-html) - Generate HTML with flattened component instances
