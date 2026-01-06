---
title: "Tutorial: Building a Button"
description: Step-by-step guide to building a complete button component.
---

# Tutorial: Building a Button Component

Let's build a complete button component with variants, props, events, and state styles.

## Step 1: Create the Package

```bash
coral init my-buttons
cd my-buttons
```

## Step 2: Add the Button Component

```bash
coral add component Button --category Actions
```

## Step 3: Define the Component

Edit `components/button/button.coral.json`:

```json
{
  "$schema": "https://coral.design/schema.json",
  "name": "Button",
  "elementType": "button",

  "$meta": {
    "name": "Button",
    "version": "1.0.0",
    "status": "stable",
    "category": "Actions",
    "description": "A versatile button component with multiple variants",
    "tags": ["interactive", "form", "action"]
  },

  "componentVariants": {
    "axes": [
      {
        "name": "intent",
        "values": ["primary", "secondary", "destructive", "ghost"],
        "default": "primary",
        "description": "Visual style of the button"
      },
      {
        "name": "size",
        "values": ["sm", "md", "lg"],
        "default": "md",
        "description": "Size of the button"
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
      "default": false,
      "description": "Whether the button is disabled"
    },
    "loading": {
      "type": "boolean",
      "default": false,
      "description": "Show loading state"
    },
    "leftIcon": {
      "type": "ReactNode",
      "description": "Icon to show before the label"
    },
    "rightIcon": {
      "type": "ReactNode",
      "description": "Icon to show after the label"
    }
  },

  "events": {
    "onClick": {
      "description": "Called when the button is clicked",
      "parameters": [
        { "name": "event", "type": "React.MouseEvent<HTMLButtonElement>" }
      ]
    }
  },

  "slots": [
    {
      "name": "leftIcon",
      "description": "Icon slot before label",
      "multiple": false
    },
    {
      "name": "rightIcon",
      "description": "Icon slot after label",
      "multiple": false
    }
  ],

  "styles": {
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "gap": "8px",
    "borderRadius": "6px",
    "fontWeight": "500",
    "border": "none",
    "cursor": "pointer",
    "transition": "all 150ms ease"
  },

  "variantStyles": {
    "intent": {
      "primary": {
        "backgroundColor": "#007bff",
        "color": "#ffffff"
      },
      "secondary": {
        "backgroundColor": "#e9ecef",
        "color": "#212529"
      },
      "destructive": {
        "backgroundColor": "#dc3545",
        "color": "#ffffff"
      },
      "ghost": {
        "backgroundColor": "transparent",
        "color": "#212529"
      }
    },
    "size": {
      "sm": { "padding": "4px 12px", "fontSize": "12px", "height": "28px" },
      "md": { "padding": "8px 16px", "fontSize": "14px", "height": "36px" },
      "lg": { "padding": "12px 24px", "fontSize": "16px", "height": "44px" }
    }
  },

  "stateStyles": {
    "hover": {
      "intent": {
        "primary": { "backgroundColor": "#0056b3" },
        "secondary": { "backgroundColor": "#dee2e6" },
        "destructive": { "backgroundColor": "#c82333" },
        "ghost": { "backgroundColor": "rgba(0, 0, 0, 0.05)" }
      }
    },
    "focus": {
      "outline": "2px solid #007bff",
      "outlineOffset": "2px"
    },
    "active": {
      "transform": "scale(0.98)"
    },
    "disabled": {
      "opacity": "0.5",
      "cursor": "not-allowed"
    }
  },

  "conditionalStyles": [
    {
      "condition": { "$prop": "loading" },
      "styles": { "cursor": "wait" }
    }
  ],

  "elementAttributes": {
    "type": "button",
    "disabled": { "$prop": "disabled" }
  },

  "eventHandlers": {
    "onClick": { "$event": "onClick" }
  },

  "ariaAttributes": {
    "aria-busy": { "$prop": "loading" }
  },

  "children": [
    {
      "name": "LeftIconSlot",
      "elementType": "span",
      "slotTarget": "leftIcon",
      "conditional": { "$prop": "leftIcon" }
    },
    {
      "name": "Spinner",
      "elementType": "span",
      "conditional": { "$prop": "loading" },
      "styles": {
        "width": "14px",
        "height": "14px",
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
    },
    {
      "name": "RightIconSlot",
      "elementType": "span",
      "slotTarget": "rightIcon",
      "conditional": { "$prop": "rightIcon" }
    }
  ]
}
```

## Step 4: Validate

```bash
coral validate
```

Expected output:
```
✓ Package is valid
  1 components
  2 token files
```

## Step 5: Build Types

```bash
coral build --target types
```

Generated `dist/types/button.d.ts`:

```typescript
// Generated by Coral - Do not edit manually
// Component: Button v1.0.0

import * as React from "react";

export interface ButtonProps {
  /** Visual style of the button */
  intent?: "primary" | "secondary" | "destructive" | "ghost";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Button text */
  label: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Icon to show before the label */
  leftIcon?: React.ReactNode;
  /** Icon to show after the label */
  rightIcon?: React.ReactNode;
  /** Called when the button is clicked */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export declare const Button: React.FC<ButtonProps>;
```

## Step 6: Use with coral-to-react

Generate a React component:

```typescript
import { coralToReact } from '@reallygoodwork/coral-to-react'
import buttonSpec from './components/button/button.coral.json'

const { reactCode, cssCode } = await coralToReact(buttonSpec, {
  componentFormat: 'arrow',
  styleFormat: 'css-modules',
})
```

## What You Built

Your button component now has:

- ✅ **4 intent variants** - primary, secondary, destructive, ghost
- ✅ **3 size variants** - sm, md, lg
- ✅ **Typed props** - label, disabled, loading, icons
- ✅ **Events** - onClick with proper typing
- ✅ **State styles** - hover, focus, active, disabled
- ✅ **Conditional rendering** - spinner when loading
- ✅ **Accessibility** - aria-busy attribute
- ✅ **Slots** - left and right icon slots

---

## Next Steps

- Add more components to your package
- Create compound variants for edge cases
- Set up token references for colors
- Generate React/Vue components

---

## Related

- [CLI Commands](/docs/packages/core/cli) - Package management
- [Variants](/docs/packages/core/variants) - Variant system
- [Props & Events](/docs/packages/core/props-events) - Typed APIs
- [coral-to-react](/docs/packages/coral-to-react) - React generation
