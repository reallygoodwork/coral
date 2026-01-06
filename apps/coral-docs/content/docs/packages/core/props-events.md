---
title: "Props & Events"
description: Typed prop and event definitions for component APIs.
---

# Props & Events

Define typed props and events for your components with full TypeScript generation support.

## Prop Definitions

```json
{
  "props": {
    "label": {
      "type": "string",
      "required": true,
      "description": "Button text",
      "editorControl": "text",
      "constraints": {
        "minLength": 1,
        "maxLength": 50
      }
    },
    "intent": {
      "type": { "enum": ["primary", "secondary", "destructive"] },
      "default": "primary",
      "editorControl": "select"
    },
    "size": {
      "type": { "enum": ["sm", "md", "lg"] },
      "default": "md"
    },
    "disabled": {
      "type": "boolean",
      "default": false
    },
    "icon": {
      "type": "ReactNode",
      "description": "Icon to show before label",
      "editorControl": "slot"
    },
    "count": {
      "type": "number",
      "constraints": { "min": 0, "max": 100 },
      "editorControl": "slider"
    }
  }
}
```

---

## Prop Types

### Primitives

```json
{ "type": "string" }
{ "type": "number" }
{ "type": "boolean" }
```

### Enums

```json
{ "type": { "enum": ["primary", "secondary", "destructive"] } }
```

### Arrays

```json
{ "type": { "array": "string" } }
{ "type": { "array": { "enum": ["a", "b", "c"] } } }
```

### Objects

```json
{ "type": "object" }
{ "type": { "object": { "theme": "string", "animate": "boolean" } } }
```

### Unions

```json
{ "type": { "union": ["string", "number"] } }
```

### ReactNode

```json
{ "type": "ReactNode" }
```

---

## Editor Controls

Hint how props should be edited in design tools:

| Control | Description |
|---------|-------------|
| `text` | Text input |
| `select` | Dropdown select |
| `boolean` | Toggle/checkbox |
| `color` | Color picker |
| `slider` | Range slider |
| `slot` | Content slot |

---

## Constraints

Add validation constraints:

```json
{
  "props": {
    "name": {
      "type": "string",
      "constraints": {
        "minLength": 1,
        "maxLength": 100,
        "pattern": "^[a-zA-Z]+"
      }
    },
    "count": {
      "type": "number",
      "constraints": {
        "min": 0,
        "max": 999,
        "step": 1
      }
    }
  }
}
```

---

## Event Definitions

```json
{
  "events": {
    "onClick": {
      "description": "Fired when button is clicked",
      "parameters": [
        { "name": "event", "type": "React.MouseEvent<HTMLButtonElement>" }
      ]
    },
    "onFocus": {
      "description": "Fired when button receives focus",
      "parameters": [
        { "name": "event", "type": "React.FocusEvent<HTMLButtonElement>" }
      ]
    },
    "onChange": {
      "description": "Fired when value changes",
      "parameters": [
        { "name": "value", "type": "string" },
        { "name": "event", "type": "React.ChangeEvent", "optional": true }
      ],
      "deprecated": "Use onValueChange instead"
    }
  }
}
```

---

## TypeScript Generation

```typescript
import { generatePropsInterface, generateComponentTypes } from '@reallygoodwork/coral-core'

const interfaceCode = generatePropsInterface(buttonComponent)
// export interface ButtonProps {
//   label: string;
//   intent?: "primary" | "secondary" | "destructive";
//   size?: "sm" | "md" | "lg";
//   disabled?: boolean;
//   onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
//   className?: string;
//   style?: React.CSSProperties;
// }

const fullTypes = generateComponentTypes(buttonComponent)
// Complete .d.ts file with imports and component declaration
```

---

## Using Props in Templates

### Text Content

```json
{ "textContent": { "$prop": "label" } }
```

### Attributes

```json
{
  "elementAttributes": {
    "href": { "$prop": "href" },
    "disabled": { "$prop": "disabled" }
  }
}
```

### Computed Values

```json
{
  "textContent": {
    "$computed": "concat",
    "$inputs": [{ "$prop": "firstName" }, " ", { "$prop": "lastName" }]
  }
}
```

### Transforms

```json
{
  "elementAttributes": {
    "aria-expanded": { "$prop": "isOpen", "$transform": "boolean" },
    "aria-disabled": { "$prop": "enabled", "$transform": "not" }
  }
}
```

---

## Binding Events

### To Component Events

```json
{
  "eventHandlers": {
    "onClick": { "$event": "onClick" },
    "onKeyDown": { "$event": "onKeyDown" }
  }
}
```

### Inline Handlers

```json
{
  "eventHandlers": {
    "onClick": {
      "$inline": "() => setIsOpen(!isOpen)"
    }
  }
}
```

---

## Utility Functions

```typescript
import {
  getRequiredProps,
  getDefaultPropValues,
  validatePropValue,
  propTypeToTypeScript,
} from '@reallygoodwork/coral-core'

// Get required prop names
const required = getRequiredProps(component.props)
// ['label']

// Get default values
const defaults = getDefaultPropValues(component.props)
// { disabled: false, size: 'md' }

// Validate a value
const errors = validatePropValue('label', propDef, '')
// ['Prop "label" must have minimum length 1']

// Convert type to TypeScript
propTypeToTypeScript({ enum: ['a', 'b'] })
// '"a" | "b"'
```

---

## Related

- [Guide: Props & Events](/docs/guides/props-events) - In-depth tutorial
- [Composition](/docs/packages/core/composition) - Prop bindings
- [References](/docs/packages/core/references) - Prop references
