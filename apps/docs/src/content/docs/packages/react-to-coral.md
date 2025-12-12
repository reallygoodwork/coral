---
title: "@reallygoodwork/react-to-coral"
description: Transform React component source code into Coral specifications.
---

Transform React component source code into Coral specifications. This package uses static analysis to parse React components and extract their structure, props, state, methods, and styling into a portable Coral format.

## Features

- **Static Analysis** - Parse React components using Babel's AST parser
- **Props Extraction** - Automatically extract component props and their TypeScript types
- **State Detection** - Identify React hooks (useState, useEffect, useMemo, etc.)
- **Method Extraction** - Extract event handlers and custom methods
- **Style Processing** - Convert inline styles and Tailwind classes to Coral styles
- **Import Tracking** - Capture all component imports
- **TypeScript Support** - Full support for TypeScript components with type annotations
- **Validation** - Built-in validation for component structure and syntax
- **JSX Parsing** - Transform JSX elements into Coral node structure

## Installation

```bash
npm install @reallygoodwork/react-to-coral
```

```bash
pnpm add @reallygoodwork/react-to-coral
```

```bash
yarn add @reallygoodwork/react-to-coral
```

---

## Functions

### `transformReactComponentToSpec`

Transforms a React component's source code into a Coral specification. Analyzes the component's structure, props, state, methods, and JSX to create a complete Coral representation.

**Signature:**
```typescript
function transformReactComponentToSpec(
  component: string,
  options?: { skipValidation?: boolean }
): CoralRootNode
```

**Parameters:**
- `component` - The React component source code as a string
- `options` (optional) - Configuration options
  - `skipValidation` - Skip component validation (default: `false`)

**Returns:** A `CoralRootNode` containing the complete component specification

**Throws:**
- Error if component validation fails
- Error if parsing fails
- Error if transformation fails

**Example:**
```typescript
import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral';

const componentCode = `
import React, { useState } from 'react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export default function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <button
      className={\`px-4 py-2 rounded-lg \${variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'}\`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  );
}
`;

const coralSpec = transformReactComponentToSpec(componentCode);
```

---

## What Gets Extracted

### Component Information

**Component Name:**
- Extracted from function declarations, arrow functions, or export statements
- Supports: `function Button()`, `const Button = () => {}`, `export default function Button()`

**Component Type:**
- Detected as either `'ArrowFunction'` or `'Function'`

### Props

**Prop Types:**
- Extracts props from function parameters (destructuring)
- Supports TypeScript type annotations: `React.FC<PropsType>`, inline types
- Captures default values
- Identifies optional vs required props
- Maps TypeScript types to Coral types (`string`, `number`, `boolean`, `array`, `object`, `function`)

**Supported Patterns:**
```typescript
// Destructured props
function Button({ label, onClick }) { ... }

// TypeScript inline type
function Button({ label, onClick }: { label: string; onClick: () => void }) { ... }

// TypeScript interface/type
interface ButtonProps { ... }
function Button({ label, onClick }: ButtonProps) { ... }

// React.FC with generics
const Button: React.FC<ButtonProps> = ({ label, onClick }) => { ... }
```

### State Hooks

**Supported Hooks:**
- `useState` - Basic state
- `useEffect` - Side effects
- `useReducer` - Complex state management
- `useContext` - Context consumption
- `useMemo` - Memoized values
- `useCallback` - Memoized callbacks

**Extracted Information:**
- State variable name
- Setter function name
- Initial value
- TypeScript type annotations
- Hook type
- Dependencies array (for useEffect, useMemo, useCallback)
- Reducer function (for useReducer)

### Methods

**Event Handlers:**
- Extracts arrow functions and function declarations defined within the component
- Captures method body
- Identifies parameters and their types
- Tracks state interactions (which state variables are read/written)

### Imports

**Import Tracking:**
- Captures all import statements
- Records source package/module
- Tracks import specifiers (default, named, aliased)
- Sets version to `'latest'` by default

### JSX Elements

**Element Parsing:**
- Converts JSX tree to Coral node structure
- Maps HTML elements to appropriate `elementType`
- Extracts element attributes
- Processes text content
- Handles nested children

**Style Processing:**
- Inline styles → Coral style objects
- Tailwind classes → CSS properties (via `@reallygoodwork/coral-tw2css`)
- Responsive styles extracted from media queries
- Supports both static and dynamic styling

---

## Type Definitions

### `UIElement`

Represents a UI element in the component tree during parsing.

```typescript
interface UIElement {
  elementType: string
  isComponent: boolean
  importSource?: string
  componentProperties?: CoralComponentPropertyType
  children: UIElement[]
  textContent?: string
}
```

### `PropReference`

Represents a reference to a prop, state, or method.

```typescript
interface PropReference {
  type: 'method' | 'state' | 'prop'
  value: string
}
```

### `ValidationError`

Represents a validation error or warning.

```typescript
interface ValidationError {
  type: 'syntax' | 'structure' | 'compatibility'
  message: string
  suggestion?: string
}
```

### `ValidationResult`

Result of component validation.

```typescript
interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}
```

---

## Usage Examples

### Basic Component

```typescript
import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral';

const simpleComponent = `
import React from 'react';

export default function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
`;

const spec = transformReactComponentToSpec(simpleComponent);
console.log(spec.componentName); // "Greeting"
```

### Component with State

```typescript
const statefulComponent = `
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
`;

const spec = transformReactComponentToSpec(statefulComponent);
console.log(spec.stateHooks);
// [{
//   name: "count",
//   setterName: "setCount",
//   initialValue: 0,
//   hookType: "useState"
// }]
```

### TypeScript Component

```typescript
const typescriptComponent = `
import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserCardProps {
  userId: number;
  onUserLoad?: (user: User) => void;
}

export default function UserCard({ userId, onUserLoad }: UserCardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
        if (onUserLoad) onUserLoad(data);
      });
  }, [userId, onUserLoad]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
}
`;

const spec = transformReactComponentToSpec(typescriptComponent);
```

### Component with Tailwind

```typescript
const tailwindComponent = `
import React from 'react';

export default function Card({ title, description }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl md:p-8">
      <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}
`;

const spec = transformReactComponentToSpec(tailwindComponent);
// Tailwind classes are converted to CSS properties
```

### Saving to File

```typescript
import fs from 'fs';
import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral';

const componentCode = fs.readFileSync('./MyComponent.tsx', 'utf-8');
const spec = transformReactComponentToSpec(componentCode);

fs.writeFileSync(
  './MyComponent.coral.json',
  JSON.stringify(spec, null, 2)
);
```

### Integration with Build Tools

```typescript
import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral';
import glob from 'glob';
import fs from 'fs';

const components = glob.sync('src/components/**/*.tsx');

components.forEach(filePath => {
  const code = fs.readFileSync(filePath, 'utf-8');
  try {
    const spec = transformReactComponentToSpec(code);
    const outputPath = filePath.replace(/\.tsx$/, '.coral.json');
    fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
    console.log(`✓ Converted ${filePath}`);
  } catch (error) {
    console.error(`✗ Failed to convert ${filePath}:`, error.message);
  }
});
```

---

## Validation

The package includes built-in validation to ensure component code is valid before transformation.

### Validation Checks

**Syntax Validation:**
- Non-empty string input
- Balanced braces `{}`
- Balanced parentheses `()`
- Balanced brackets `[]`

**Structure Validation:**
- Presence of React import (warning if missing)
- Valid React component pattern
- JSX elements present (warning if missing)

### Manual Validation

```typescript
import { validateReactComponent } from '@reallygoodwork/react-to-coral';

const code = `...component code...`;
const validation = validateReactComponent(code);

if (!validation.isValid) {
  console.error('Validation errors:');
  validation.errors.forEach(err => {
    console.error(`- [${err.type}] ${err.message}`);
    if (err.suggestion) {
      console.error(`  Suggestion: ${err.suggestion}`);
    }
  });
}
```

---

## Limitations

### Not Supported

- **Class components** - Only functional components are supported
- **Complex expressions** - Some complex JavaScript expressions in JSX may not be fully parsed
- **Dynamic imports** - Only static imports are tracked
- **HOCs** - Higher-order component patterns may not be fully captured
- **Render props** - Render prop patterns are not fully supported

### Best Results With

- Functional components (arrow functions or function declarations)
- TypeScript with explicit type annotations
- Props via destructuring
- React Hooks (useState, useEffect, etc.)
- Standard HTML elements or imported components
- Tailwind CSS classes or inline styles
- Simple to moderate component complexity

---

## Performance Considerations

**Optimization tips:**
```typescript
// Skip validation for known-good code
const spec = transformReactComponentToSpec(code, { skipValidation: true });

// Process multiple components in parallel
const specs = await Promise.all(
  components.map(code =>
    Promise.resolve(transformReactComponentToSpec(code))
  )
);
```

---

## Related Packages

- `@reallygoodwork/coral-core` - Core utilities and types for Coral
- `@reallygoodwork/coral-to-react` - Convert Coral specs to React components (reverse operation)
- `@reallygoodwork/coral-to-html` - Convert Coral specs to HTML
- `@reallygoodwork/coral-tw2css` - Convert Tailwind classes to CSS
- `@reallygoodwork/style-to-tailwind` - Convert CSS styles to Tailwind classes
