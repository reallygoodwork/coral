# @reallygoodwork/coral-to-react

Generate React components from Coral UI specifications.

[![npm](https://img.shields.io/npm/v/@reallygoodwork/coral-to-react)](https://www.npmjs.com/package/@reallygoodwork/coral-to-react)

## Installation

```bash
npm install @reallygoodwork/coral-to-react
# or
pnpm add @reallygoodwork/coral-to-react
# or
yarn add @reallygoodwork/coral-to-react
```

## Overview

This package generates React component code from a Coral UI specification. It produces:

- React component with proper structure
- TypeScript props interface (with support for new typed props system)
- State hooks
- Event handler methods
- Styled JSX (inline or CSS classes)
- **Component composition** - Renders component instances with prop/slot bindings
- **Package generation** - Generate entire component libraries from Coral packages

## API Reference

### Functions

#### `coralToReact(spec, options?)`

Converts a Coral specification to React component code.

```typescript
import { coralToReact } from '@reallygoodwork/coral-to-react'
import type { CoralRootNode } from '@reallygoodwork/coral-core'

const spec: CoralRootNode = {
  componentName: 'Button',
  elementType: 'button',
  componentProperties: {
    label: { type: 'string', value: 'label' },
    onClick: { type: '() => void', value: 'onClick', optional: true }
  },
  styles: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px'
  },
  children: []
}

const { reactCode, cssCode } = await coralToReact(spec, {
  componentFormat: 'arrow',
  styleFormat: 'inline',
  includeTypes: true
})

// reactCode:
// import React from 'react'
//
// interface ButtonProps {
//   label: string
//   onClick?: () => void
// }
//
// export const Button = (props: ButtonProps) => {
//   return (
//     <button style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px' }}>
//       {props.label}
//     </button>
//   )
// }
```

**Parameters:**
- `spec: CoralRootNode` - Coral specification
- `options?: Options` - Generation options

**Returns:**
- `Promise<{ reactCode: string; cssCode: string }>` - Generated code

---

### Options

```typescript
interface Options {
  // Component format: 'arrow' or 'function' (default: 'function')
  componentFormat?: 'arrow' | 'function'

  // Style format: 'inline' or 'className' (default: 'inline')
  styleFormat?: 'inline' | 'className'

  // Include TypeScript types (default: true)
  includeTypes?: boolean

  // Indent size in spaces (default: 2)
  indentSize?: number

  // Format with Prettier (default: false)
  prettier?: boolean

  // Whether to flatten component composition (default: false)
  flattenComposition?: boolean

  // How to handle variants: 'cva' | 'inline' | 'custom' (default: 'inline')
  variantStrategy?: 'cva' | 'inline' | 'custom'
}
```

---

#### `generatePackage(package, options?)`

**NEW** - Generate an entire component library from a Coral package.

```typescript
import { loadPackage } from '@reallygoodwork/coral-core'
import { generatePackage } from '@reallygoodwork/coral-to-react'
import * as fs from 'fs/promises'

const pkg = await loadPackage('./coral.config.json', {
  readFile: (path) => fs.readFile(path, 'utf-8'),
})

const result = await generatePackage(pkg, {
  componentFormat: 'arrow',
  styleFormat: 'className',
  includeTypes: true,
})

// Write all component files
for (const file of result.components) {
  await fs.writeFile(`./dist/${file.path}`, file.content)
}

// Write CSS files
for (const file of result.styles) {
  await fs.writeFile(`./dist/${file.path}`, file.content)
}

// Write index file
if (result.index) {
  await fs.writeFile(`./dist/${result.index.path}`, result.index.content)
}
```

**Parameters:**
- `package: LoadedPackage` - Loaded Coral package from `@reallygoodwork/coral-core`
- `options?: Options` - Generation options

**Returns:**
- `Promise<PackageGenerationResult>` - Object with component files, styles, and index

---

#### `generateComponent(spec, options?)`

Lower-level function for component generation.

```typescript
import { generateComponent } from '@reallygoodwork/coral-to-react'

const { reactCode, cssCode } = await generateComponent(spec, options)
```

---

#### `generateJSXElement(node, depth?, idMapping?)`

Generates JSX for a single node.

```typescript
import { generateJSXElement } from '@reallygoodwork/coral-to-react'

const jsx = generateJSXElement(node)
// '<div style={{ padding: "20px" }}>...</div>'
```

---

#### `generatePropsInterface(properties, componentName)`

Generates TypeScript props interface.

```typescript
import { generatePropsInterface } from '@reallygoodwork/coral-to-react'

const propsInterface = generatePropsInterface(
  { title: { type: 'string', value: 'title' } },
  'Card'
)
// 'interface CardProps {\n  title: string\n}'
```

---

#### `generateStateHooks(stateHooks)`

Generates useState hooks.

```typescript
import { generateStateHooks } from '@reallygoodwork/coral-to-react'

const hooks = generateStateHooks([
  { name: 'count', setter: 'setCount', initialValue: 0 }
])
// 'const [count, setCount] = useState(0)'
```

---

#### `generateMethods(methods)`

Generates method declarations.

```typescript
import { generateMethods } from '@reallygoodwork/coral-to-react'

const methods = generateMethods([
  { name: 'handleClick', parameters: [], body: 'console.log("clicked")' }
])
// 'const handleClick = () => {\n  console.log("clicked")\n}'
```

---

#### `generateImports(imports)`

Generates import statements.

```typescript
import { generateImports } from '@reallygoodwork/coral-to-react'

const imports = generateImports([
  { source: 'react', specifiers: [{ name: 'useState' }] }
])
// "import { useState } from 'react'"
```

---

#### `generateCSS(spec, idMapping?)`

Generates CSS for className style format.

```typescript
import { generateCSS } from '@reallygoodwork/coral-to-react'

const css = generateCSS(spec, new Map())
// '.component-root { padding: 20px; }'
```

---

#### `stylesToInlineStyle(styles)`

Converts a styles object to an inline style string.

```typescript
import { stylesToInlineStyle } from '@reallygoodwork/coral-to-react'

const inlineStyle = stylesToInlineStyle({ padding: '20px', margin: '10px' })
// 'style={{ padding: "20px", margin: "10px" }}'
```

---

## Examples

### Arrow Function Component

```typescript
const { reactCode } = await coralToReact(spec, {
  componentFormat: 'arrow',
  includeTypes: true
})

// Output:
// export const MyComponent = (props: MyComponentProps) => {
//   return (...)
// }
```

### Function Declaration

```typescript
const { reactCode } = await coralToReact(spec, {
  componentFormat: 'function',
  includeTypes: true
})

// Output:
// export function MyComponent(props: MyComponentProps) {
//   return (...)
// }
```

### With CSS Classes

```typescript
const { reactCode, cssCode } = await coralToReact(spec, {
  styleFormat: 'className'
})

// reactCode includes: className="component-root"
// cssCode includes: .component-root { ... }
```

### With Prettier Formatting

```typescript
const { reactCode } = await coralToReact(spec, {
  prettier: true
})
// Formatted with Prettier
```

### Component Composition

**NEW** - Components can now embed other components using `COMPONENT_INSTANCE` type:

```typescript
const cardSpec: CoralRootNode = {
  name: 'Card',
  elementType: 'div',
  props: {
    title: { type: 'string', required: true },
    onSave: { type: 'function' }
  },
  children: [
    {
      id: 'save-button',
      name: 'SaveButton',
      type: 'COMPONENT_INSTANCE',
      elementType: 'button',
      $component: {
        ref: './button.coral.json'
      },
      propBindings: {
        label: 'Save',
        intent: 'primary'
      },
      eventBindings: {
        onClick: { $event: 'onSave' }
      }
    }
  ]
}

const { reactCode } = await coralToReact(cardSpec)

// Output includes:
// import { Button } from './Button'
// ...
// <Button label="Save" intent="primary" onClick={props.onSave} />
```

---

## Complete Example

```typescript
import { coralToReact } from '@reallygoodwork/coral-to-react'

const spec = {
  componentName: 'UserCard',
  elementType: 'div',
  componentProperties: {
    name: { type: 'string', value: 'name' },
    email: { type: 'string', value: 'email' },
    onEdit: { type: '() => void', value: 'onEdit', optional: true }
  },
  stateHooks: [
    { name: 'isExpanded', setter: 'setIsExpanded', initialValue: false }
  ],
  methods: [
    { name: 'toggleExpand', parameters: [], body: 'setIsExpanded(!isExpanded)' }
  ],
  styles: {
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  children: [
    {
      elementType: 'h3',
      textContent: '{props.name}',
      styles: { fontSize: '18px', fontWeight: 'bold' }
    },
    {
      elementType: 'p',
      textContent: '{props.email}',
      styles: { color: '#666' }
    }
  ]
}

const { reactCode, cssCode } = await coralToReact(spec, {
  componentFormat: 'arrow',
  styleFormat: 'inline',
  includeTypes: true,
  prettier: true
})
```

---

## Type Safety

The package is fully type-safe:
- **No `any` types** - All types use `unknown` with proper type guards
- **Type-safe style handling** - `CoralStyleType` properly typed with recursive support
- **Safe type assertions** - Uses `as unknown as T` pattern only when necessary for Babel AST types
- **Proper null handling** - Handles `null` values in `CoralTSTypes` correctly

## Related Packages

- [@reallygoodwork/coral-core](https://www.npmjs.com/package/@reallygoodwork/coral-core) - Core Coral types
- [@reallygoodwork/react-to-coral](https://www.npmjs.com/package/@reallygoodwork/react-to-coral) - React to Coral
- [@reallygoodwork/coral-to-html](https://www.npmjs.com/package/@reallygoodwork/coral-to-html) - Coral to HTML

## License

MIT © [Really Good Work](https://reallygoodwork.com)
