---
title: "Props & Events"
description: Learn how to define typed props and events for your Coral components.
---

## Introduction

Coral components support typed props and events, enabling type-safe component APIs with full TypeScript generation.

> **Related:** This guide covers props and events concepts in depth. For API reference, see [Props & Events API](/docs/packages/core/props-events). For examples of props in generated React components, see [Coral to React](/docs/packages/coral-to-react).

## Defining Props

Props are defined in the `props` field of a component:

```json
{
  "name": "Button",
  "elementType": "button",

  "props": {
    "label": {
      "type": "string",
      "required": true,
      "description": "Button text"
    },
    "disabled": {
      "type": "boolean",
      "default": false,
      "description": "Whether the button is disabled"
    },
    "size": {
      "type": { "enum": ["sm", "md", "lg"] },
      "default": "md"
    }
  }
}
```

## Prop Types

### Primitive Types

```json
{
  "props": {
    "name": { "type": "string" },
    "count": { "type": "number" },
    "enabled": { "type": "boolean" }
  }
}
```

### Enum Types

```json
{
  "props": {
    "intent": {
      "type": { "enum": ["primary", "secondary", "destructive"] },
      "default": "primary"
    },
    "size": {
      "type": { "enum": ["sm", "md", "lg"] }
    }
  }
}
```

### Array Types

```json
{
  "props": {
    "items": {
      "type": { "array": "string" },
      "description": "List of items"
    },
    "options": {
      "type": { "array": { "enum": ["a", "b", "c"] } }
    }
  }
}
```

### Object Types

```json
{
  "props": {
    "style": {
      "type": "object",
      "description": "Custom style object"
    },
    "config": {
      "type": {
        "object": {
          "theme": "string",
          "animate": "boolean"
        }
      }
    }
  }
}
```

### Union Types

```json
{
  "props": {
    "value": {
      "type": { "union": ["string", "number"] }
    }
  }
}
```

### ReactNode

For slot-like props:

```json
{
  "props": {
    "icon": {
      "type": "ReactNode",
      "description": "Icon to display"
    },
    "children": {
      "type": "ReactNode",
      "description": "Content"
    }
  }
}
```

### Function Types

```json
{
  "props": {
    "renderItem": {
      "type": {
        "function": {
          "params": [
            { "name": "item", "type": "T" },
            { "name": "index", "type": "number" }
          ],
          "returns": "ReactNode"
        }
      }
    }
  }
}
```

## Prop Properties

| Property | Type | Description |
|----------|------|-------------|
| `type` | PropType | The prop type |
| `default` | any | Default value |
| `required` | boolean | Whether prop is required |
| `description` | string | Documentation |
| `editorControl` | string | Editor UI hint |
| `constraints` | object | Validation constraints |

### Editor Controls

Hint how the prop should be edited in design tools:

```json
{
  "props": {
    "label": {
      "type": "string",
      "editorControl": "text"
    },
    "color": {
      "type": "string",
      "editorControl": "color"
    },
    "opacity": {
      "type": "number",
      "editorControl": "slider",
      "constraints": { "min": 0, "max": 1 }
    },
    "intent": {
      "type": { "enum": ["primary", "secondary"] },
      "editorControl": "select"
    },
    "visible": {
      "type": "boolean",
      "editorControl": "boolean"
    }
  }
}
```

### Constraints

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

## Defining Events

Events are defined in the `events` field:

```json
{
  "name": "Button",
  "elementType": "button",

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
    }
  }
}
```

## Event Properties

| Property | Type | Description |
|----------|------|-------------|
| `description` | string | Documentation |
| `parameters` | array | Event parameters |
| `deprecated` | boolean/string | Deprecation notice |

### Event Parameters

```json
{
  "events": {
    "onChange": {
      "parameters": [
        { "name": "value", "type": "string" },
        { "name": "event", "type": "React.ChangeEvent", "optional": true }
      ]
    }
  }
}
```

### Deprecation

```json
{
  "events": {
    "onSelect": {
      "description": "Called when item is selected",
      "deprecated": "Use onChange instead",
      "parameters": [{ "name": "value", "type": "string" }]
    }
  }
}
```

---

## Using Props in Templates

### Text Content

```json
{
  "textContent": { "$prop": "label" }
}
```

### Attributes

```json
{
  "elementAttributes": {
    "href": { "$prop": "href" },
    "target": { "$prop": "target" },
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

### Ternary Expressions

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

### To DOM Events

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

### With Parameters

```json
{
  "eventHandlers": {
    "onClick": {
      "$event": "onItemClick",
      "$params": [{ "$prop": "id" }]
    }
  }
}
```

---

## TypeScript Generation

### Generate Props Interface

```typescript
import { generatePropsInterface } from '@reallygoodwork/coral-core'

const code = generatePropsInterface(buttonComponent)
```

Output:

```typescript
export interface ButtonProps {
  /** Button text */
  label: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Fired when button is clicked */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}
```

### Generate Complete Types

```typescript
import { generateComponentTypes } from '@reallygoodwork/coral-core'

const code = generateComponentTypes(buttonComponent)
```

Output:

```typescript
// Generated by Coral - Do not edit manually
// Component: Button v1.0.0

import * as React from "react";

export interface ButtonProps {
  label: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Button: React.FC<ButtonProps>;
```

### Type Conversion

```typescript
import { propTypeToTS } from '@reallygoodwork/coral-core'

propTypeToTS('string')                    // 'string'
propTypeToTS('number')                    // 'number'
propTypeToTS('boolean')                   // 'boolean'
propTypeToTS({ enum: ['a', 'b'] })        // '"a" | "b"'
propTypeToTS({ array: 'string' })         // 'string[]'
propTypeToTS('ReactNode')                 // 'React.ReactNode'
propTypeToTS({ union: ['string', 'number'] }) // 'string | number'
```

---

## Validation

### Validate Prop Values

```typescript
import { validatePropValue, validateProps } from '@reallygoodwork/coral-core'

// Validate a single value
const errors = validatePropValue(
  'label',
  { type: 'string', constraints: { minLength: 1 } },
  ''
)
// ['Prop "label" must have minimum length 1']

// Validate all props for a package
const result = validateProps(pkg)
for (const error of result.errors) {
  console.error(error.message)
}
```

### Get Required Props

```typescript
import { getRequiredProps } from '@reallygoodwork/coral-core'

const required = getRequiredProps(buttonComponent.props)
// ['label']
```

### Get Default Values

```typescript
import { getDefaultPropValues } from '@reallygoodwork/coral-core'

const defaults = getDefaultPropValues(buttonComponent.props)
// { disabled: false, size: 'md' }
```

---

## Complete Example

```json
{
  "$schema": "https://coral.design/schema.json",
  "name": "Select",
  "elementType": "div",

  "$meta": {
    "name": "Select",
    "version": "1.0.0",
    "status": "stable",
    "description": "A dropdown select component"
  },

  "props": {
    "options": {
      "type": { "array": { "object": { "value": "string", "label": "string" } } },
      "required": true,
      "description": "Options to display"
    },
    "value": {
      "type": "string",
      "description": "Currently selected value"
    },
    "placeholder": {
      "type": "string",
      "default": "Select an option",
      "description": "Placeholder text"
    },
    "disabled": {
      "type": "boolean",
      "default": false
    },
    "error": {
      "type": "string",
      "description": "Error message"
    },
    "size": {
      "type": { "enum": ["sm", "md", "lg"] },
      "default": "md",
      "editorControl": "select"
    }
  },

  "events": {
    "onChange": {
      "description": "Called when selection changes",
      "parameters": [
        { "name": "value", "type": "string" },
        { "name": "option", "type": "{ value: string; label: string }" }
      ]
    },
    "onBlur": {
      "description": "Called when focus leaves the select"
    },
    "onFocus": {
      "description": "Called when select receives focus"
    }
  },

  "componentVariants": {
    "axes": [
      { "name": "size", "values": ["sm", "md", "lg"], "default": "md" }
    ]
  },

  "styles": {
    "position": "relative",
    "display": "inline-block"
  },

  "variantStyles": {
    "size": {
      "sm": { "fontSize": "12px" },
      "md": { "fontSize": "14px" },
      "lg": { "fontSize": "16px" }
    }
  },

  "conditionalStyles": [
    {
      "condition": { "$prop": "error" },
      "styles": { "borderColor": "#ef4444" }
    },
    {
      "condition": { "$prop": "disabled" },
      "styles": { "opacity": "0.5", "cursor": "not-allowed" }
    }
  ],

  "children": [
    {
      "name": "Trigger",
      "elementType": "button",
      "elementAttributes": {
        "type": "button",
        "disabled": { "$prop": "disabled" },
        "aria-haspopup": "listbox",
        "aria-expanded": false
      },
      "eventHandlers": {
        "onFocus": { "$event": "onFocus" },
        "onBlur": { "$event": "onBlur" }
      },
      "children": [
        {
          "name": "SelectedValue",
          "elementType": "span",
          "textContent": {
            "$computed": "ternary",
            "$inputs": [
              { "$prop": "value" },
              { "$prop": "value" },
              { "$prop": "placeholder" }
            ]
          }
        },
        {
          "name": "ChevronIcon",
          "elementType": "span",
          "textContent": "▼",
          "styles": { "marginLeft": "8px" }
        }
      ]
    },
    {
      "name": "ErrorMessage",
      "elementType": "span",
      "conditional": { "$prop": "error" },
      "textContent": { "$prop": "error" },
      "styles": { "color": "#ef4444", "fontSize": "12px", "marginTop": "4px" }
    }
  ]
}
```

## Best Practices

### 1. Always Add Descriptions

```json
{
  "props": {
    "label": {
      "type": "string",
      "description": "The text displayed on the button"  // Good!
    }
  }
}
```

### 2. Set Sensible Defaults

```json
{
  "props": {
    "size": {
      "type": { "enum": ["sm", "md", "lg"] },
      "default": "md"  // Most common case
    }
  }
}
```

### 3. Mark Required Props

```json
{
  "props": {
    "children": {
      "type": "ReactNode",
      "required": true  // Component won't work without it
    }
  }
}
```

### 4. Use Appropriate Editor Controls

```json
{
  "props": {
    "color": { "type": "string", "editorControl": "color" },
    "items": { "type": { "array": "string" }, "editorControl": "list" }
  }
}
```

### 5. Document Deprecated Props

```json
{
  "props": {
    "onChange": {
      "type": { "function": {} },
      "deprecated": "Use onValueChange instead"
    }
  }
}
```

## Next Steps

### Related Guides
- [Component Variants](/docs/guides/variants) - Add variants to components (variants can be used as props)
- [Component Composition](/docs/guides/composition) - Use props in component instances and slot bindings
- [Package System](/docs/guides/packages) - Organize components with typed APIs into packages

### API Documentation
- [Props & Events API](/docs/packages/core/props-events) - Full props/events API reference
- [Conditional Rendering](/docs/packages/core/conditionals) - Show/hide based on props
- [Coral to React](/docs/packages/coral-to-react) - Generate TypeScript interfaces from props definitions
