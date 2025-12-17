---
title: Getting Started
description: Learn how to use Coral Libraries in your project.
---

## Installation

Install the packages you need from npm:

```bash
# Core package (required for all transformations)
npm install @reallygoodwork/coral-core

# Transform React to Coral specification
npm install @reallygoodwork/react-to-coral

# Generate React from Coral specification
npm install @reallygoodwork/coral-to-react

# Generate HTML from Coral specification
npm install @reallygoodwork/coral-to-html

# Tailwind CSS utilities
npm install @reallygoodwork/coral-tw2css
npm install @reallygoodwork/style-to-tailwind
```

## Quick Example: React → Coral → React

Transform a React component to a Coral specification and back:

```typescript
import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral'
import { coralToReact } from '@reallygoodwork/coral-to-react'

// Your React component as a string
const reactCode = `
export const Button = ({ label, onClick }) => {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onClick}>
      {label}
    </button>
  )
}
`

// Transform to Coral specification
const spec = transformReactComponentToSpec(reactCode)

// Generate React component from specification
const { reactCode: generatedCode, cssCode } = await coralToReact(spec, {
  componentFormat: 'arrow',
  styleFormat: 'inline',
})
```

## Quick Example: HTML → Coral

Transform HTML into a Coral specification:

```typescript
import { transformHTMLToSpec } from '@reallygoodwork/coral-core'

const html = `
<div class="container mx-auto">
  <h1 style="font-size: 24px; color: blue;">Hello World</h1>
  <p>Welcome to Coral</p>
</div>
`

const spec = transformHTMLToSpec(html)
```

## Quick Example: Coral → HTML

Generate HTML from a Coral specification:

```typescript
import { coralToHTML } from '@reallygoodwork/coral-to-html'

const spec = {
  elementType: 'div',
  styles: { padding: '20px', backgroundColor: '#f0f0f0' },
  children: [
    { elementType: 'h1', textContent: 'Hello World' }
  ]
}

const html = await coralToHTML(spec)
```

## Quick Example: Tailwind → CSS

Convert Tailwind classes to CSS style objects:

```typescript
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css'

const styles = tailwindToCSS('p-4 bg-blue-500 text-white rounded-lg')
// {
//   paddingInlineStart: '1rem',
//   paddingInlineEnd: '1rem',
//   paddingBlockStart: '1rem',
//   paddingBlockEnd: '1rem',
//   backgroundColor: '#3b82f6',
//   color: '#ffffff',
//   borderRadius: '0.5rem'
// }
```

## Development

To work on the monorepo locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/reallygoodwork/coral.git
   cd coral
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build all packages:
   ```bash
   pnpm build
   ```

4. Run tests:
   ```bash
   pnpm test
   ```

5. Run in development mode:
   ```bash
   pnpm dev
   ```

## Package Links

- [@reallygoodwork/coral-core](https://www.npmjs.com/package/@reallygoodwork/coral-core) - Core types and utilities
- [@reallygoodwork/coral-tw2css](https://www.npmjs.com/package/@reallygoodwork/coral-tw2css) - Tailwind to CSS
- [@reallygoodwork/style-to-tailwind](https://www.npmjs.com/package/@reallygoodwork/style-to-tailwind) - CSS to Tailwind
- [@reallygoodwork/react-to-coral](https://www.npmjs.com/package/@reallygoodwork/react-to-coral) - React to Coral
- [@reallygoodwork/coral-to-react](https://www.npmjs.com/package/@reallygoodwork/coral-to-react) - Coral to React
- [@reallygoodwork/coral-to-html](https://www.npmjs.com/package/@reallygoodwork/coral-to-html) - Coral to HTML

## Next Steps

- Learn about [releasing packages](/guides/releasing/)
- Explore available [packages](/packages/core/)
