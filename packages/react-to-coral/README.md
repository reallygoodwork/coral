# @reallygoodwork/react-to-coral

Transform React components into Coral UI specifications.

[![npm](https://img.shields.io/npm/v/@reallygoodwork/react-to-coral)](https://www.npmjs.com/package/@reallygoodwork/react-to-coral)

## Installation

```bash
npm install @reallygoodwork/react-to-coral
# or
pnpm add @reallygoodwork/react-to-coral
# or
yarn add @reallygoodwork/react-to-coral
```

## Overview

This package parses React component source code and transforms it into a Coral UI specification. It extracts:

- Component structure and hierarchy
- Props and their TypeScript types
- State hooks (useState)
- Methods and event handlers
- Styles (inline styles and Tailwind classes)
- Imports

## API Reference

### Functions

#### `transformReactComponentToSpec(component, options?)`

Transforms a React component string into a Coral specification.

```typescript
import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral'

const reactCode = `
import React, { useState } from 'react'

interface ButtonProps {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (onClick) onClick()
  }

  return (
    <button
      className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  )
}
`

const spec = transformReactComponentToSpec(reactCode)

// Result:
// {
//   $schema: 'https://coral.design/schema.json',
//   name: 'Button',
//   componentName: 'Button',
//   elementType: 'button',
//   type: 'COMPONENT',
//   componentProperties: {
//     label: { type: 'string', value: 'label', optional: false },
//     onClick: { type: '() => void', value: 'onClick', optional: true },
//     variant: { type: "'primary' | 'secondary'", value: 'variant', optional: true }
//   },
//   stateHooks: [
//     { name: 'isHovered', setter: 'setIsHovered', initialValue: 'boolean' }
//   ],
//   methods: [
//     { name: 'handleClick', parameters: [] }
//   ],
//   styles: {
//     paddingInlineStart: '1rem',
//     paddingInlineEnd: '1rem',
//     paddingBlockStart: '0.5rem',
//     paddingBlockEnd: '0.5rem',
//     borderRadius: '0.5rem',
//     backgroundColor: '#3b82f6',
//     color: '#ffffff'
//   },
//   imports: [
//     { source: 'react', specifiers: [{ name: 'React', isDefault: true }, { name: 'useState' }] }
//   ],
//   children: []
// }
```

**Parameters:**
- `component: string` - React component source code
- `options?: { skipValidation?: boolean }` - Options
  - `skipValidation` - Skip input validation (default: `false`)

**Returns:**
- `CoralRootNode` - The Coral specification

**Throws:**
- `Error` if the component cannot be parsed or is invalid

---

## Supported React Patterns

### Function Components

```typescript
// Arrow function
const MyComponent = () => { ... }

// Function declaration
function MyComponent() { ... }

// Export default
export default function MyComponent() { ... }
```

### TypeScript Props

```typescript
// Interface
interface Props {
  title: string
  count?: number
}

// Type alias
type Props = {
  title: string
  count?: number
}

// React.FC
const Component: React.FC<Props> = (props) => { ... }

// Inline destructuring
const Component = ({ title, count }: Props) => { ... }
```

### State Hooks

```typescript
const [count, setCount] = useState(0)
const [items, setItems] = useState<string[]>([])
const [user, setUser] = useState<User | null>(null)
```

### Methods

```typescript
const handleClick = () => { ... }
const handleSubmit = (e: FormEvent) => { ... }
const fetchData = async () => { ... }
```

### Styles

```typescript
// Tailwind classes
<div className="flex items-center p-4 bg-white">

// Inline styles
<div style={{ padding: '20px', backgroundColor: 'white' }}>

// Combined
<div className="flex" style={{ gap: '10px' }}>
```

---

## Example: Complete Workflow

```typescript
import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral'
import { coralToReact } from '@reallygoodwork/coral-to-react'

// 1. Parse React component
const originalCode = `
export const Card = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <div>{children}</div>
  </div>
)
`

const spec = transformReactComponentToSpec(originalCode)

// 2. Modify the specification
spec.styles.backgroundColor = '#f0f0f0'
spec.componentName = 'UpdatedCard'

// 3. Generate new React component
const { reactCode } = await coralToReact(spec)
```

---

## Validation

The package validates input before processing:

- Checks for valid React component syntax
- Validates JSX structure
- Ensures proper component exports

```typescript
import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral'

// Skip validation for trusted input
const spec = transformReactComponentToSpec(code, { skipValidation: true })
```

---

## Type Safety

The package is fully type-safe:
- **No `any` types** - All types use `unknown` with proper type guards
- **Type-safe AST traversal** - Uses proper Babel types throughout
- **Nullable types** - Returns `null` for `CoralTSTypes` when type cannot be determined (aligns with `z.nullable` schema)
- **Proper type extraction** - TypeScript types are extracted and validated

## Limitations

- Only functional components are supported (no class components)
- Complex hooks beyond `useState` are not fully analyzed
- Dynamic style computations may not be captured
- Template literals in JSX are simplified
- When a prop type cannot be determined, it returns `null` (not `'any'`) to align with `CoralTSTypes` schema

---

## Related Packages

- [@reallygoodwork/coral-core](https://www.npmjs.com/package/@reallygoodwork/coral-core) - Core Coral types
- [@reallygoodwork/coral-to-react](https://www.npmjs.com/package/@reallygoodwork/coral-to-react) - Coral to React
- [@reallygoodwork/coral-tw2css](https://www.npmjs.com/package/@reallygoodwork/coral-tw2css) - Tailwind to CSS

## License

MIT © [Really Good Work](https://reallygoodwork.com)
