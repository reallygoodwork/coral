# Coral Libraries

A monorepo of libraries for transforming UI components between different representations: React components, HTML, and a universal Coral specification format.

## 📦 Packages

| Package | Description | npm |
|---------|-------------|-----|
| [@reallygoodwork/coral-core](./packages/core) | Core types, schemas, and utilities for the Coral specification | [![npm](https://img.shields.io/npm/v/@reallygoodwork/coral-core)](https://www.npmjs.com/package/@reallygoodwork/coral-core) |
| [@reallygoodwork/coral-tw2css](./packages/tw2css) | Convert Tailwind CSS classes to CSS style objects | [![npm](https://img.shields.io/npm/v/@reallygoodwork/coral-tw2css)](https://www.npmjs.com/package/@reallygoodwork/coral-tw2css) |
| [@reallygoodwork/style-to-tailwind](./packages/style-to-tailwind) | Convert CSS style objects to Tailwind CSS classes | [![npm](https://img.shields.io/npm/v/@reallygoodwork/style-to-tailwind)](https://www.npmjs.com/package/@reallygoodwork/style-to-tailwind) |
| [@reallygoodwork/react-to-coral](./packages/react-to-coral) | Transform React components to Coral specification | [![npm](https://img.shields.io/npm/v/@reallygoodwork/react-to-coral)](https://www.npmjs.com/package/@reallygoodwork/react-to-coral) |
| [@reallygoodwork/coral-to-react](./packages/coral-to-react) | Generate React components from Coral specification | [![npm](https://img.shields.io/npm/v/@reallygoodwork/coral-to-react)](https://www.npmjs.com/package/@reallygoodwork/coral-to-react) |
| [@reallygoodwork/coral-to-html](./packages/coral-to-html) | Generate HTML from Coral specification | [![npm](https://img.shields.io/npm/v/@reallygoodwork/coral-to-html)](https://www.npmjs.com/package/@reallygoodwork/coral-to-html) |

## 🚀 What is Coral?

Coral is a universal specification format for describing UI components. It captures:

- **Structure**: Element types, children, and hierarchy
- **Styles**: CSS properties with responsive breakpoint support
- **State**: React hooks and state management
- **Methods**: Event handlers and component logic
- **Props**: Component properties with TypeScript types
- **Imports**: Dependencies and module imports

This allows you to:
- Parse React components into a structured format
- Generate React components from the specification
- Convert to/from HTML
- Analyze component structure programmatically

## 📋 Quick Start

### Installation

Install the packages you need:

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

### Example: React → Coral → React

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

### Example: HTML → Coral

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

### Example: Coral → HTML

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

## 🏗️ Architecture

```
┌─────────────────┐
│  React Component │
└────────┬────────┘
         │ react-to-coral
         ▼
┌─────────────────┐       ┌─────────────────┐
│      HTML       │◄─────►│ Coral Spec      │
└─────────────────┘       │ (Universal)     │
  transformHTMLToSpec     └────────┬────────┘
  coralToHTML                      │
                                   │ coral-to-react
                                   ▼
                          ┌─────────────────┐
                          │ React Component │
                          └─────────────────┘
```

## 🛠️ Development

### Prerequisites

- Node.js 22+
- pnpm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/reallygoodwork/coral.git
cd coral

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Type check
pnpm check-types
```

### Development Mode

```bash
# Watch and rebuild all packages
pnpm dev

# Build a specific package
pnpm build --filter=@reallygoodwork/coral-core
```

## 📖 Documentation

- [Getting Started Guide](./apps/docs/src/content/docs/guides/getting-started.md)
- [Release Guide](./RELEASING.md)
- [API Documentation](./apps/docs)

## 📦 Releasing Packages

This monorepo uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and releases.

Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Feature (minor version bump)
git commit -m "feat(coral-core): add new utility function"

# Bug fix (patch version bump)
git commit -m "fix(coral-to-react): correct JSX generation"

# Breaking change (major version bump)
git commit -m "feat(coral-core)!: change API signature"
```

See the [Release Guide](./RELEASING.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## 📄 License

MIT © [Really Good Work](https://reallygoodwork.com)
