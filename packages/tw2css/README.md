# @reallygoodwork/coral-tw2css

Convert Tailwind CSS classes to CSS style objects.

[![npm](https://img.shields.io/npm/v/@reallygoodwork/coral-tw2css)](https://www.npmjs.com/package/@reallygoodwork/coral-tw2css)

## Installation

```bash
npm install @reallygoodwork/coral-tw2css
# or
pnpm add @reallygoodwork/coral-tw2css
# or
yarn add @reallygoodwork/coral-tw2css
```

## Overview

This package converts Tailwind CSS utility classes into CSS style objects. It supports responsive breakpoints, pseudo-selectors, and most common Tailwind utilities.

## API Reference

### Functions

#### `tailwindToCSS(tailwind)`

Converts a string of Tailwind CSS classes to a CSS style object.

```typescript
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css'

// Basic usage
tailwindToCSS('p-4 m-2 bg-blue-500')
// {
//   paddingInlineStart: '1rem',
//   paddingInlineEnd: '1rem',
//   paddingBlockStart: '1rem',
//   paddingBlockEnd: '1rem',
//   marginInlineStart: '0.5rem',
//   marginInlineEnd: '0.5rem',
//   marginBlockStart: '0.5rem',
//   marginBlockEnd: '0.5rem',
//   backgroundColor: '#3b82f6'
// }

// With responsive breakpoints
tailwindToCSS('p-4 md:p-8 lg:p-12')
// {
//   paddingInlineStart: '1rem',
//   paddingInlineEnd: '1rem',
//   paddingBlockStart: '1rem',
//   paddingBlockEnd: '1rem',
//   '(min-width: 768px)': {
//     paddingInlineStart: '2rem',
//     paddingInlineEnd: '2rem',
//     paddingBlockStart: '2rem',
//     paddingBlockEnd: '2rem'
//   },
//   '(min-width: 1024px)': {
//     paddingInlineStart: '3rem',
//     paddingInlineEnd: '3rem',
//     paddingBlockStart: '3rem',
//     paddingBlockEnd: '3rem'
//   }
// }

// With pseudo-selectors
tailwindToCSS('bg-blue-500 hover:bg-blue-600')
// {
//   backgroundColor: '#3b82f6',
//   ':hover': {
//     backgroundColor: '#2563eb'
//   }
// }
```

**Parameters:**
- `tailwind: string` - Space-separated Tailwind CSS classes

**Returns:**
- `object` - CSS style object with camelCase property names

---

#### `convertTailwindScaletoPixels(scale)`

Converts Tailwind spacing scale values to pixel values.

```typescript
import { convertTailwindScaletoPixels } from '@reallygoodwork/coral-tw2css'

convertTailwindScaletoPixels('4')     // '1rem' (16px)
convertTailwindScaletoPixels('0.5')   // '0.125rem' (2px)
convertTailwindScaletoPixels('px')    // '1px'
convertTailwindScaletoPixels('full')  // '100%'

// Color scales
convertTailwindScaletoPixels('blue-500')  // '#3b82f6'
convertTailwindScaletoPixels('red-600')   // '#dc2626'
```

**Parameters:**
- `scale: string` - Tailwind scale value (e.g., '4', 'blue-500', 'full')

**Returns:**
- `string` - CSS value

---

## Supported Classes

### Layout

| Tailwind | CSS |
|----------|-----|
| `flex` | `display: flex` |
| `block` | `display: block` |
| `inline` | `display: inline` |
| `grid` | `display: grid` |
| `hidden` | `display: none` |

### Flexbox

| Tailwind | CSS |
|----------|-----|
| `flex-row` | `flex-direction: row` |
| `flex-col` | `flex-direction: column` |
| `justify-center` | `justify-content: center` |
| `justify-between` | `justify-content: space-between` |
| `items-center` | `align-items: center` |
| `flex-wrap` | `flex-wrap: wrap` |
| `gap-{n}` | `gap: {value}` |

### Spacing

| Tailwind | CSS |
|----------|-----|
| `p-{n}` | All padding |
| `px-{n}` | `padding-inline-start`, `padding-inline-end` |
| `py-{n}` | `padding-block-start`, `padding-block-end` |
| `pt-{n}`, `pr-{n}`, `pb-{n}`, `pl-{n}` | Individual padding |
| `m-{n}` | All margin |
| `mx-{n}`, `my-{n}` | Horizontal/vertical margin |
| `mt-{n}`, `mr-{n}`, `mb-{n}`, `ml-{n}` | Individual margin |

### Sizing

| Tailwind | CSS |
|----------|-----|
| `w-{n}` | `width` |
| `h-{n}` | `height` |
| `min-w-{n}` | `min-width` |
| `max-w-{n}` | `max-width` |
| `min-h-{n}` | `min-height` |
| `max-h-{n}` | `max-height` |

### Colors

| Tailwind | CSS |
|----------|-----|
| `bg-{color}-{shade}` | `background-color` |
| `text-{color}-{shade}` | `color` |
| `border-{color}-{shade}` | `border-color` |

### Typography

| Tailwind | CSS |
|----------|-----|
| `text-{size}` | `font-size` |
| `font-{weight}` | `font-weight` |
| `leading-{n}` | `line-height` |
| `tracking-{n}` | `letter-spacing` |
| `text-left`, `text-center`, `text-right` | `text-align` |

### Borders

| Tailwind | CSS |
|----------|-----|
| `border` | `border: 1px solid` |
| `border-{n}` | `border-width` |
| `rounded` | `border-radius: 0.25rem` |
| `rounded-{size}` | `border-radius` |
| `rounded-full` | `border-radius: 9999px` |

### Effects

| Tailwind | CSS |
|----------|-----|
| `shadow` | `box-shadow` |
| `shadow-{size}` | `box-shadow` |
| `opacity-{n}` | `opacity` |

### Accessibility

| Tailwind | CSS |
|----------|-----|
| `sr-only` | Screen reader only (visually hidden) |
| `not-sr-only` | Undo screen reader only |

---

## Responsive Breakpoints

The package supports Tailwind's default breakpoints:

| Breakpoint | Media Query |
|------------|-------------|
| `sm:` | `(min-width: 640px)` |
| `md:` | `(min-width: 768px)` |
| `lg:` | `(min-width: 1024px)` |
| `xl:` | `(min-width: 1280px)` |
| `2xl:` | `(min-width: 1536px)` |

---

## Pseudo-Selectors

Supported pseudo-selectors are converted to nested objects:

| Tailwind | Object Key |
|----------|------------|
| `hover:` | `:hover` |
| `focus:` | `:focus` |
| `active:` | `:active` |
| `disabled:` | `:disabled` |
| `first:` | `:first-child` |
| `last:` | `:last-child` |

---

## Example: Full Usage

```typescript
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css'

const styles = tailwindToCSS(
  'flex flex-col items-center justify-center p-4 md:p-8 bg-white rounded-lg shadow-lg hover:shadow-xl'
)

// Result:
// {
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   paddingInlineStart: '1rem',
//   paddingInlineEnd: '1rem',
//   paddingBlockStart: '1rem',
//   paddingBlockEnd: '1rem',
//   backgroundColor: '#ffffff',
//   borderRadius: '0.5rem',
//   boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), ...',
//   '(min-width: 768px)': {
//     paddingInlineStart: '2rem',
//     paddingInlineEnd: '2rem',
//     paddingBlockStart: '2rem',
//     paddingBlockEnd: '2rem'
//   },
//   ':hover': {
//     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
//   }
// }
```

## Related Packages

- [@reallygoodwork/coral-core](https://www.npmjs.com/package/@reallygoodwork/coral-core) - Core Coral types
- [@reallygoodwork/style-to-tailwind](https://www.npmjs.com/package/@reallygoodwork/style-to-tailwind) - CSS to Tailwind
- [@reallygoodwork/react-to-coral](https://www.npmjs.com/package/@reallygoodwork/react-to-coral) - React to Coral

## License

MIT © [Really Good Work](https://reallygoodwork.com)
