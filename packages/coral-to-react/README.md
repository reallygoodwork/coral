# @reallygoodwork/coral-to-react

Generate React component code from Coral specifications. This package transforms Coral JSON specifications into fully functional React components with TypeScript support, state management, event handlers, and styling.

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

---

## Functions

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

console.log(reactCode);
// Output:
// import React from 'react'
//
// interface ButtonProps {
//   label: string
//   onClick?: () => void
// }
//
// export function Button(props: ButtonProps) {
//   return (
//     <button style={{ padding: '10px 20px', backgroundColor: '#007bff', ... }}>
//       {props.label}
//     </button>
//   )
// }
```

---

### `generateComponent`

Lower-level function to generate a complete React component (used internally by `coralToReact`).

**Signature:**
```typescript
async function generateComponent(
  spec: CoralRootNode,
  options?: Options
): Promise<{ reactCode: string; cssCode: string }>
```

**Parameters:**
- `spec` - Coral root node specification
- `options` - Generation options

**Returns:** Object with generated code

---

### `generateImports`

Generate import statements from Coral import specifications.

**Signature:**
```typescript
function generateImports(imports?: Array<CoralImportType>): string
```

**Parameters:**
- `imports` - Array of Coral import specifications

**Returns:** Generated import statements as a string

**Example:**
```typescript
import { generateImports } from '@reallygoodwork/coral-to-react';

const imports = generateImports([
  {
    source: 'react',
    version: 'latest',
    specifiers: [
      { name: 'useState', isDefault: false },
      { name: 'useEffect', isDefault: false }
    ]
  }
]);

console.log(imports);
// import { useState, useEffect } from 'react'
```

---

### `generatePropsInterface`

Generate TypeScript interface for component props.

**Signature:**
```typescript
function generatePropsInterface(
  props?: CoralComponentPropertyType,
  componentName?: string
): string
```

**Parameters:**
- `props` - Component properties from Coral spec
- `componentName` - Name of the component

**Returns:** TypeScript interface definition

**Example:**
```typescript
import { generatePropsInterface } from '@reallygoodwork/coral-to-react';

const propsInterface = generatePropsInterface(
  {
    label: { type: 'string' },
    count: { type: 'number' },
    onClick: { type: 'function' }
  },
  'Button'
);

console.log(propsInterface);
// interface ButtonProps {
//   label: string
//   count: number
//   onClick?: () => void
// }
```

---

### `generateStateHooks`

Generate React state hook code from Coral state specifications.

**Signature:**
```typescript
function generateStateHooks(stateHooks?: Array<CoralStateType>): string
```

**Parameters:**
- `stateHooks` - Array of state hook specifications

**Returns:** Generated hook code

**Example:**
```typescript
import { generateStateHooks } from '@reallygoodwork/coral-to-react';

const hooks = generateStateHooks([
  {
    name: 'count',
    setterName: 'setCount',
    initialValue: 0,
    tsType: 'number',
    hookType: 'useState'
  }
]);

console.log(hooks);
// const [count, setCount] = useState<number>(0)
```

---

### `generateMethods`

Generate method/function code from Coral method specifications.

**Signature:**
```typescript
function generateMethods(methods?: Array<CoralMethodType>): string
```

**Parameters:**
- `methods` - Array of method specifications

**Returns:** Generated method code

**Example:**
```typescript
import { generateMethods } from '@reallygoodwork/coral-to-react';

const methods = generateMethods([
  {
    name: 'handleClick',
    body: 'console.log("clicked")',
    parameters: []
  }
]);

console.log(methods);
// const handleClick = () => {
//   console.log("clicked")
// }
```

---

### `generateJSXElement`

Generate JSX code from a Coral node.

**Signature:**
```typescript
function generateJSXElement(
  node: CoralNode,
  depth?: number,
  idMapping?: Map<CoralNode, string>
): string
```

**Parameters:**
- `node` - Coral node to convert
- `depth` - Indentation depth (default: 0)
- `idMapping` - Map for tracking CSS class IDs

**Returns:** Generated JSX string

---

### `generateCSS`

Generate CSS code from Coral styles.

**Signature:**
```typescript
function generateCSS(
  spec: CoralRootNode,
  idMapping?: Map<CoralNode, string>
): string
```

**Parameters:**
- `spec` - Coral specification
- `idMapping` - Map for tracking CSS class IDs

**Returns:** Generated CSS string

---

### `stylesToInlineStyle`

Convert Coral style objects to React inline style objects.

**Signature:**
```typescript
function stylesToInlineStyle(styles: CoralStyleType): Record<string, string | number>
```

**Parameters:**
- `styles` - Coral style object

**Returns:** React-compatible inline style object

**Example:**
```typescript
import { stylesToInlineStyle } from '@reallygoodwork/coral-to-react';

const inlineStyle = stylesToInlineStyle({
  padding: { value: 10, unit: 'px' },
  backgroundColor: { hex: '#007bff', rgb: {...}, hsl: {...} },
  fontSize: '16px'
});

console.log(inlineStyle);
// { padding: '10px', backgroundColor: '#007bff', fontSize: '16px' }
```

---

## Options

### `Options` Interface

Configuration options for code generation.

```typescript
interface Options {
  /**
   * Component declaration style
   * @default 'function'
   */
  componentFormat?: 'function' | 'arrow'

  /**
   * How to output styles
   * @default 'inline'
   */
  styleFormat?: 'inline' | 'className'

  /**
   * Generate TypeScript types for props
   * @default true
   */
  includeTypes?: boolean

  /**
   * Indentation size in spaces
   * @default 2
   */
  indentSize?: number

  /**
   * Format output with Prettier
   * @default false
   */
  prettier?: boolean
}
```

### Option Details

#### `componentFormat`

Choose between function declaration or arrow function style.

**Function declaration (`'function'`):**
```typescript
export function Button(props: ButtonProps) {
  return <button>Click me</button>
}
```

**Arrow function (`'arrow'`):**
```typescript
export const Button = (props: ButtonProps) => {
  return <button>Click me</button>
}
```

#### `styleFormat`

Choose between inline styles or CSS classes.

**Inline styles (`'inline'`):**
```typescript
<button style={{ padding: '10px', backgroundColor: '#007bff' }}>
  Click me
</button>
```

**CSS classes (`'className'`):**
```typescript
// Component
<button className="coral-root-Button">Click me</button>

// Separate CSS file
.coral-root-Button {
  padding: 10px;
  background-color: #007bff;
}
```

#### `includeTypes`

Control TypeScript type generation.

**With types (`true`, default):**
```typescript
interface ButtonProps {
  label: string
  onClick?: () => void
}

export function Button(props: ButtonProps) {
  // ...
}
```

**Without types (`false`):**
```typescript
export function Button(props) {
  // ...
}
```

#### `indentSize`

Set the number of spaces for indentation (default: 2).

#### `prettier`

Format the generated code with Prettier (default: false).

---

## Usage Examples

### Basic Component Generation

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
      textContent: 'Card Title',
      styles: { fontSize: '24px', marginBottom: '10px' }
    },
    {
      name: 'content',
      elementType: 'p',
      textContent: 'Card content goes here.',
      styles: { color: '#666' }
    }
  ]
};

const { reactCode } = await coralToReact(spec);
console.log(reactCode);
```

### Component with Props

```typescript
const spec = {
  name: 'Greeting',
  componentName: 'Greeting',
  elementType: 'div',
  componentProperties: {
    name: { type: 'string' },
    age: { type: 'number' },
    onGreet: { type: 'function' }
  },
  children: [
    {
      name: 'message',
      elementType: 'p',
      textContent: 'Hello, {props.name}! You are {props.age} years old.'
    },
    {
      name: 'button',
      elementType: 'button',
      elementAttributes: {
        onClick: '{props.onGreet}'
      },
      textContent: 'Greet'
    }
  ]
};

const { reactCode } = await coralToReact(spec, {
  componentFormat: 'arrow',
  includeTypes: true
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
      name: 'display',
      elementType: 'p',
      textContent: 'Count: {count}'
    },
    {
      name: 'button',
      elementType: 'button',
      elementAttributes: {
        onClick: '{increment}'
      },
      textContent: 'Increment'
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
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#0056b3'
    }
  },
  textContent: 'Click me'
};

const { reactCode, cssCode } = await coralToReact(spec, {
  styleFormat: 'className'
});

console.log(reactCode);
// Component with className="coral-root-StyledButton"

console.log(cssCode);
// .coral-root-StyledButton {
//   padding: 12px 24px;
//   background-color: #007bff;
//   ...
// }
// .coral-root-StyledButton:hover {
//   background-color: #0056b3;
// }
```

### With Prettier Formatting

```typescript
const { reactCode } = await coralToReact(spec, {
  prettier: true,
  indentSize: 4
});

// Output will be formatted with Prettier
```

### Saving to Files

```typescript
import fs from 'fs';
import { coralToReact } from '@reallygoodwork/coral-to-react';

const spec = { /* your Coral spec */ };

const { reactCode, cssCode } = await coralToReact(spec, {
  styleFormat: 'className'
});

// Save React component
fs.writeFileSync('./components/MyComponent.tsx', reactCode);

// Save CSS file (if using className style)
if (cssCode) {
  fs.writeFileSync('./components/MyComponent.css', cssCode);
}
```

### Batch Processing

```typescript
import { coralToReact } from '@reallygoodwork/coral-to-react';
import fs from 'fs';
import path from 'path';
import glob from 'glob';

// Read all Coral specs
const specFiles = glob.sync('./specs/**/*.coral.json');

for (const specFile of specFiles) {
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf-8'));
  const { reactCode, cssCode } = await coralToReact(spec, {
    componentFormat: 'function',
    styleFormat: 'className',
    prettier: true
  });

  const componentName = spec.componentName || spec.name;
  const outputDir = './src/components';

  fs.writeFileSync(
    path.join(outputDir, `${componentName}.tsx`),
    reactCode
  );

  if (cssCode) {
    fs.writeFileSync(
      path.join(outputDir, `${componentName}.css`),
      cssCode
    );
  }

  console.log(`✓ Generated ${componentName}`);
}
```

---

## Generated Code Features

### Imports

Automatically generates necessary imports:
```typescript
import React from 'react'
import { useState, useEffect } from 'react'
import { CustomComponent } from './CustomComponent'
```

### Props Interface

TypeScript interface for props:
```typescript
interface ComponentNameProps {
  requiredProp: string
  optionalProp?: number
  callback?: () => void
  complexType?: Array<string>
}
```

### State Hooks

React hooks for state management:
```typescript
const [count, setCount] = useState<number>(0)
const [user, setUser] = useState<User | null>(null)
```

### Methods

Event handlers and helper functions:
```typescript
const handleClick = () => {
  setCount(count + 1)
}

const processData = (data: string[]) => {
  // method body
}
```

### JSX Elements

Component rendering:
```typescript
return (
  <div className="container">
    <h1>{props.title}</h1>
    <button onClick={handleClick}>Click me</button>
  </div>
)
```

---

## Style Conversion

The package handles various Coral style formats:

### Dimension Objects
```typescript
// Coral
{ padding: { value: 10, unit: 'px' } }

// React
{ padding: '10px' }
```

### Color Objects
```typescript
// Coral
{ backgroundColor: { hex: '#007bff', rgb: {...}, hsl: {...} } }

// React
{ backgroundColor: '#007bff' }
```

### Nested Styles (Pseudo-classes)
```typescript
// Coral
{
  color: '#333',
  ':hover': { color: '#000' }
}

// CSS
.component {
  color: #333;
}
.component:hover {
  color: #000;
}
```

### Responsive Styles
```typescript
// Coral
{
  padding: '10px',
  responsiveStyles: [
    {
      breakpoint: { type: 'min-width', value: '768px' },
      styles: { padding: '20px' }
    }
  ]
}

// CSS
.component {
  padding: 10px;
}
@media (min-width: 768px) {
  .component {
    padding: 20px;
  }
}
```

---

## Limitations

- **Complex Logic** - Advanced component logic may need manual adjustment
- **Dynamic Imports** - Dynamic import() statements are not generated
- **Refs** - React refs are not automatically generated
- **Context** - Context providers/consumers require manual setup
- **Fragments** - Fragment shorthand may not be preserved
- **Comments** - Code comments are not preserved in generated output

---

## Dependencies

- `@reallygoodwork/coral-core` - Core Coral types and utilities
- `prettier` - Code formatting (optional)

---

## Related Packages

- `@reallygoodwork/coral-core` - Core utilities and types for Coral
- `@reallygoodwork/react-to-coral` - Convert React components to Coral specs (reverse operation)
- `@reallygoodwork/coral-to-html` - Convert Coral specs to HTML
- `@reallygoodwork/coral-tw2css` - Convert Tailwind classes to CSS
- `@reallygoodwork/style-to-tailwind` - Convert CSS styles to Tailwind classes

---

## License

MIT
