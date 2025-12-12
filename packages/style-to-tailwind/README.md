# @reallygoodwork/style-to-tailwind

Convert CSS style objects to Tailwind CSS classes.

[![npm](https://img.shields.io/npm/v/@reallygoodwork/style-to-tailwind)](https://www.npmjs.com/package/@reallygoodwork/style-to-tailwind)

## Installation

```bash
npm install @reallygoodwork/style-to-tailwind
# or
pnpm add @reallygoodwork/style-to-tailwind
# or
yarn add @reallygoodwork/style-to-tailwind
```

## Overview

This package converts CSS style objects into Tailwind CSS utility classes. It's useful for converting inline styles or style objects to Tailwind's utility-first approach.

## API Reference

### Functions

#### `styleToTailwind(style)`

Converts a CSS style object to Tailwind CSS classes.

```typescript
import { styleToTailwind } from '@reallygoodwork/style-to-tailwind'

// Basic usage
const styles = {
  backgroundColor: '#fafafa',
  paddingBlockStart: 96,
  paddingBlockEnd: 96,
}

const tailwindClasses = styleToTailwind(styles)
// "backgroundColor-#fafafa paddingBlockStart-96 paddingBlockEnd-96"
```

**Parameters:**
- `style: StyleObject` - CSS style object with camelCase property names

**Returns:**
- `string` - Space-separated Tailwind CSS classes

---

### Types

```typescript
type StyleObject = {
  [key: string]: string | number | ColorObject | StyleObject
}

type ColorObject = {
  hex?: string
  rgb?: {
    r: number
    g: number
    b: number
    a: number
  }
  hsl?: {
    h: number
    s: number
    l: number
    a: number
  }
}
```

---

## Example: With Nested Styles

The function handles nested style objects for responsive breakpoints:

```typescript
import { styleToTailwind } from '@reallygoodwork/style-to-tailwind'

const styles = {
  paddingBlockStart: 96,
  paddingBlockEnd: 96,
  sm: {
    paddingBlockStart: 128,
    paddingBlockEnd: 128,
  },
}

const tailwindClasses = styleToTailwind(styles)
```

---

## Example: With Color Objects

Color objects with hex/rgb/hsl values are also supported:

```typescript
import { styleToTailwind } from '@reallygoodwork/style-to-tailwind'

const styles = {
  backgroundColor: {
    hex: '#fafafa',
    rgb: { r: 250, g: 250, b: 250, a: 1 },
    hsl: { h: 0, s: 0, l: 98, a: 1 },
  },
}

const tailwindClasses = styleToTailwind(styles)
```

---

## Related Packages

- [@reallygoodwork/coral-core](https://www.npmjs.com/package/@reallygoodwork/coral-core) - Core Coral types
- [@reallygoodwork/coral-tw2css](https://www.npmjs.com/package/@reallygoodwork/coral-tw2css) - Tailwind to CSS
- [@reallygoodwork/coral-to-react](https://www.npmjs.com/package/@reallygoodwork/coral-to-react) - Coral to React

## License

MIT © [Really Good Work](https://reallygoodwork.com)
