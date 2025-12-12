---
title: "@reallygoodwork/coral-to-react"
description: Generate React component code from Coral specifications.
---

Generate React component code from Coral specifications. This package transforms Coral JSON specifications into fully functional React components with TypeScript support, state management, event handlers, and styling.

## Features

- **Code Generation** - Generate complete React components from Coral specs
- **TypeScript Support** - Automatically generate TypeScript interfaces for props
- **Component Formats** - Choose between function declarations or arrow functions
- **Style Options** - Output inline styles or separate CSS classes
- **State Management** - Generate React hooks (useState, useEffect, etc.)
- **Event Handlers** - Create methods and event handler functions
- **Prettier Integration** - Optional code formatting with Prettier
- **Import Management** - Generate necessary import statements
- **Props Interface** - Auto-generate TypeScript prop types

## Installation

```bash
npm install @reallygoodwork/coral-to-react
```

```bash
pnpm add @reallygoodwork/coral-to-react
```

```bash
yarn add @reallygoodwork/coral-to-react
```

---

## Main Function

### `coralToReact`

Main function to convert a Coral specification into React component code.

**Signature:**
```typescript
async function coralToReact(
  spec: CoralRootNode,
  options?: Options
): Promise<{ reactCode: string; cssCode: string }>
```

**Parameters:**
- `spec` - A Coral root node specification
- `options` (optional) - Generation options

**Returns:** Promise resolving to an object with:
- `reactCode` - Generated React component code (string)
- `cssCode` - Generated CSS code (string, empty if using inline styles)

**Example:**
```typescript
import { coralToReact } from '@reallygoodwork/coral-to-react';
import type { CoralRootNode } from '@reallygoodwork/coral-core';

const spec: CoralRootNode = {
  name: 'Button',
  componentName: 'Button',
  elementType: 'button',
  componentProperties: {
    label: { type: 'string' },
    onClick: { type: 'function' }
  },
  styles: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  textContent: '{props.label}'
};

const { reactCode, cssCode } = await coralToReact(spec);
```

---

## Helper Functions

### `generateImports`

Generate import statements from Coral import specifications.

```typescript
function generateImports(imports?: Array<CoralImportType>): string
```

### `generatePropsInterface`

Generate TypeScript interface for component props.

```typescript
function generatePropsInterface(
  props?: CoralComponentPropertyType,
  componentName?: string
): string
```

### `generateStateHooks`

Generate React state hook code from Coral state specifications.

```typescript
function generateStateHooks(stateHooks?: Array<CoralStateType>): string
```

### `generateMethods`

Generate method/function code from Coral method specifications.

```typescript
function generateMethods(methods?: Array<CoralMethodType>): string
```

### `generateJSXElement`

Generate JSX code from a Coral node.

```typescript
function generateJSXElement(
  node: CoralNode,
  depth?: number,
  idMapping?: Map<CoralNode, string>
): string
```

### `generateCSS`

Generate CSS code from Coral styles.

```typescript
function generateCSS(
  spec: CoralRootNode,
  idMapping?: Map<CoralNode, string>
): string
```

### `stylesToInlineStyle`

Convert Coral style objects to React inline style objects.

```typescript
function stylesToInlineStyle(styles: CoralStyleType): Record<string, string | number>
```

---

## Options

### `Options` Interface

```typescript
interface Options {
  componentFormat?: 'function' | 'arrow'  // default: 'function'
  styleFormat?: 'inline' | 'className'    // default: 'inline'
  includeTypes?: boolean                   // default: true
  indentSize?: number                      // default: 2
  prettier?: boolean                       // default: false
}
```

### `componentFormat`

Choose between function declaration or arrow function style.

**Function declaration:**
```typescript
export function Button(props: ButtonProps) {
  return <button>Click me</button>
}
```

**Arrow function:**
```typescript
export const Button = (props: ButtonProps) => {
  return <button>Click me</button>
}
```

### `styleFormat`

Choose between inline styles or CSS classes.

**Inline styles:**
```typescript
<button style={{ padding: '10px', backgroundColor: '#007bff' }}>
  Click me
</button>
```

**CSS classes:**
```typescript
// Component
<button className="coral-root-Button">Click me</button>

// Separate CSS file
.coral-root-Button {
  padding: 10px;
  background-color: #007bff;
}
```

### `includeTypes`

Control TypeScript type generation (default: `true`).

### `indentSize`

Set the number of spaces for indentation (default: `2`).

### `prettier`

Format the generated code with Prettier (default: `false`).

---

## Usage Examples

### Basic Component

```typescript
import { coralToReact } from '@reallygoodwork/coral-to-react';

const spec = {
  name: 'Card',
  componentName: 'Card',
  elementType: 'div',
  styles: {
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  children: [
    {
      name: 'title',
      elementType: 'h2',
      textContent: 'Card Title'
    }
  ]
};

const { reactCode } = await coralToReact(spec);
```

### Component with Props

```typescript
const spec = {
  name: 'Greeting',
  componentName: 'Greeting',
  elementType: 'div',
  componentProperties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  children: [
    {
      name: 'message',
      elementType: 'p',
      textContent: 'Hello, {props.name}!'
    }
  ]
};

const { reactCode } = await coralToReact(spec, {
  componentFormat: 'arrow'
});
```

### Component with State

```typescript
const spec = {
  name: 'Counter',
  componentName: 'Counter',
  elementType: 'div',
  stateHooks: [
    {
      name: 'count',
      setterName: 'setCount',
      initialValue: 0,
      tsType: 'number',
      hookType: 'useState'
    }
  ],
  methods: [
    {
      name: 'increment',
      body: 'setCount(count + 1)',
      parameters: []
    }
  ],
  children: [
    {
      name: 'button',
      elementType: 'button',
      elementAttributes: { onClick: '{increment}' },
      textContent: 'Count: {count}'
    }
  ]
};

const { reactCode } = await coralToReact(spec);
```

### Using CSS Classes

```typescript
const spec = {
  name: 'StyledButton',
  componentName: 'StyledButton',
  elementType: 'button',
  styles: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    ':hover': {
      backgroundColor: '#0056b3'
    }
  },
  textContent: 'Click me'
};

const { reactCode, cssCode } = await coralToReact(spec, {
  styleFormat: 'className'
});
```

### With Prettier

```typescript
const { reactCode } = await coralToReact(spec, {
  prettier: true,
  indentSize: 4
});
```

### Saving to Files

```typescript
import fs from 'fs';
import { coralToReact } from '@reallygoodwork/coral-to-react';

const spec = { /* your spec */ };

const { reactCode, cssCode } = await coralToReact(spec, {
  styleFormat: 'className'
});

fs.writeFileSync('./MyComponent.tsx', reactCode);

if (cssCode) {
  fs.writeFileSync('./MyComponent.css', cssCode);
}
```

---

## Generated Code Features

### TypeScript Interface

```typescript
interface ButtonProps {
  label: string
  onClick?: () => void
}
```

### React Hooks

```typescript
const [count, setCount] = useState<number>(0)
const [user, setUser] = useState<User | null>(null)
```

### Methods

```typescript
const handleClick = () => {
  setCount(count + 1)
}
```

### JSX Elements

```typescript
return (
  <div className="container">
    <h1>{props.title}</h1>
    <button onClick={handleClick}>Click</button>
  </div>
)
```

---

## Style Conversion

### Dimension Objects

```typescript
// Coral: { padding: { value: 10, unit: 'px' } }
// React: { padding: '10px' }
```

### Color Objects

```typescript
// Coral: { backgroundColor: { hex: '#007bff', ... } }
// React: { backgroundColor: '#007bff' }
```

### Responsive Styles

```typescript
// Generates media queries in CSS
@media (min-width: 768px) {
  .component {
    padding: 20px;
  }
}
```

---

## Related Packages

- `@reallygoodwork/coral-core` - Core utilities and types for Coral
- `@reallygoodwork/react-to-coral` - Convert React components to Coral specs (reverse operation)
- `@reallygoodwork/coral-to-html` - Convert Coral specs to HTML
- `@reallygoodwork/coral-tw2css` - Convert Tailwind classes to CSS
