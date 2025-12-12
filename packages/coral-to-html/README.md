# @reallygoodwork/coral-to-html

Generate HTML from Coral UI specifications.

[![npm](https://img.shields.io/npm/v/@reallygoodwork/coral-to-html)](https://www.npmjs.com/package/@reallygoodwork/coral-to-html)

## Installation

```bash
npm install @reallygoodwork/coral-to-html
# or
pnpm add @reallygoodwork/coral-to-html
# or
yarn add @reallygoodwork/coral-to-html
```

## Overview

This package generates formatted HTML from a Coral UI specification. It produces clean, properly indented HTML with inline styles.

## API Reference

### Functions

#### `coralToHTML(spec)`

Converts a Coral specification to formatted HTML.

```typescript
import { coralToHTML } from '@reallygoodwork/coral-to-html'
import type { CoralRootNode } from '@reallygoodwork/coral-core'

const spec: CoralRootNode = {
  elementType: 'div',
  styles: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
  },
  children: [
    {
      elementType: 'h1',
      textContent: 'Hello World',
      styles: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '16px'
      }
    },
    {
      elementType: 'p',
      textContent: 'Welcome to Coral',
      styles: {
        color: '#666',
        lineHeight: '1.5'
      }
    }
  ]
}

const html = await coralToHTML(spec)

// Output:
// <div style="padding: 20px; background-color: #f5f5f5; border-radius: 8px">
//   <h1 style="font-size: 24px; color: #333; margin-bottom: 16px">Hello World</h1>
//   <p style="color: #666; line-height: 1.5">Welcome to Coral</p>
// </div>
```

**Parameters:**
- `spec: CoralRootNode` - Coral specification

**Returns:**
- `Promise<string>` - Formatted HTML string

---

## Features

### Style Conversion

CSS properties are converted from camelCase to kebab-case:

```typescript
const spec = {
  elementType: 'div',
  styles: {
    backgroundColor: 'blue',    // → background-color: blue
    fontSize: '16px',           // → font-size: 16px
    borderRadius: '4px',        // → border-radius: 4px
    paddingTop: '10px'          // → padding-top: 10px
  }
}
```

### Dimension Objects

Coral dimension objects are converted to CSS strings:

```typescript
const spec = {
  elementType: 'div',
  styles: {
    width: { value: 100, unit: '%' },   // → width: 100%
    height: { value: 200, unit: 'px' }, // → height: 200px
    padding: { value: 2, unit: 'rem' }  // → padding: 2rem
  }
}
```

### Color Objects

Coral color objects are converted using the hex value:

```typescript
const spec = {
  elementType: 'div',
  styles: {
    color: {
      hex: '#3b82f6',
      rgb: { r: 59, g: 130, b: 246, a: 1 },
      hsl: { h: 217, s: 91, l: 60, a: 1 }
    }
  }
}
// → color: #3b82f6
```

### Element Attributes

HTML attributes are properly formatted:

```typescript
const spec = {
  elementType: 'a',
  elementAttributes: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    'data-tracking': 'link-click'
  },
  textContent: 'Click here'
}
// → <a href="https://example.com" target="_blank" rel="noopener noreferrer" data-tracking="link-click">Click here</a>
```

### Self-Closing Tags

Self-closing HTML elements are handled correctly:

```typescript
const spec = {
  elementType: 'img',
  elementAttributes: {
    src: 'image.jpg',
    alt: 'Description'
  }
}
// → <img src="image.jpg" alt="Description" />
```

Supported self-closing tags: `area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`

### Nested Children

Children are properly nested and indented:

```typescript
const spec = {
  elementType: 'ul',
  children: [
    { elementType: 'li', textContent: 'Item 1' },
    { elementType: 'li', textContent: 'Item 2' },
    { elementType: 'li', textContent: 'Item 3' }
  ]
}
// → <ul>
//     <li>Item 1</li>
//     <li>Item 2</li>
//     <li>Item 3</li>
//   </ul>
```

---

## Complete Example

```typescript
import { coralToHTML } from '@reallygoodwork/coral-to-html'

const cardSpec = {
  elementType: 'article',
  styles: {
    maxWidth: { value: 400, unit: 'px' },
    padding: { value: 24, unit: 'px' },
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  children: [
    {
      elementType: 'img',
      elementAttributes: {
        src: 'https://example.com/image.jpg',
        alt: 'Card image'
      },
      styles: {
        width: '100%',
        borderRadius: '8px',
        marginBottom: '16px'
      }
    },
    {
      elementType: 'h2',
      textContent: 'Card Title',
      styles: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: '8px'
      }
    },
    {
      elementType: 'p',
      textContent: 'This is a description of the card content.',
      styles: {
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.6'
      }
    },
    {
      elementType: 'button',
      textContent: 'Learn More',
      styles: {
        marginTop: '16px',
        padding: '10px 20px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
      }
    }
  ]
}

const html = await coralToHTML(cardSpec)

// Output:
// <article style="max-width: 400px; padding: 24px; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)">
//   <img src="https://example.com/image.jpg" alt="Card image" style="width: 100%; border-radius: 8px; margin-bottom: 16px" />
//   <h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin-bottom: 8px">Card Title</h2>
//   <p style="font-size: 14px; color: #666; line-height: 1.6">This is a description of the card content.</p>
//   <button style="margin-top: 16px; padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer">Learn More</button>
// </article>
```

---

## Font Family Handling

The package automatically adds `sans-serif` fallback for Inter font:

```typescript
const spec = {
  elementType: 'p',
  styles: {
    fontFamily: 'Inter'
  }
}
// → font-family: Inter, sans-serif
```

---

## Numeric Values

Numeric style values are handled intelligently:

```typescript
const spec = {
  elementType: 'div',
  styles: {
    fontWeight: 600,    // → font-weight: 600 (no unit)
    fontSize: 16,       // → font-size: 16px (adds px)
    lineHeight: 1.5,    // → line-height: 1.5 (no unit)
    zIndex: 10          // → z-index: 10 (no unit)
  }
}
```

---

## Related Packages

- [@reallygoodwork/coral-core](https://www.npmjs.com/package/@reallygoodwork/coral-core) - Core Coral types
- [@reallygoodwork/coral-to-react](https://www.npmjs.com/package/@reallygoodwork/coral-to-react) - Coral to React
- [@reallygoodwork/react-to-coral](https://www.npmjs.com/package/@reallygoodwork/react-to-coral) - React to Coral

## License

MIT © [Really Good Work](https://reallygoodwork.com)
