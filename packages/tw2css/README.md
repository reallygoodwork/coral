# @reallygoodwork/coral-tw2css

Convert Tailwind CSS classes to CSS-in-JS style objects. This utility package transforms Tailwind utility classes into JavaScript objects with CSS properties, making it easy to work with Tailwind styles in programmatic contexts.

## Installation

```bash
npm install @reallygoodwork/coral-tw2css
```

```bash
pnpm add @reallygoodwork/coral-tw2css
```

```bash
yarn add @reallygoodwork/coral-tw2css
```

## Features

- **Tailwind to CSS conversion** - Convert Tailwind utility classes to CSS property objects
- **Responsive breakpoints** - Support for Tailwind's responsive modifiers (sm, md, lg, xl, 2xl)
- **Pseudo-class support** - Handle hover, focus, active, and other state modifiers
- **Color system** - Full Tailwind color palette with hex, RGB, and HSL values
- **Scale conversion** - Automatically convert Tailwind's spacing scale to pixels
- **Arbitrary values** - Support for Tailwind's arbitrary value syntax `[value]`
- **TypeScript support** - Fully typed for TypeScript projects

---

## Functions

### `tailwindToCSS`

Converts a string of Tailwind CSS classes into a CSS-in-JS style object. Supports responsive modifiers, pseudo-classes, and nested styles.

**Signature:**
```typescript
function tailwindToCSS(tailwind: string): StylesWithModifiers
```

**Parameters:**
- `tailwind` - A space-separated string of Tailwind CSS classes

**Returns:** An object containing CSS properties and values, with support for nested responsive and pseudo-class styles

**Example:**
```typescript
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css';

// Basic usage
tailwindToCSS('p-4 bg-blue-500 text-white');
// Returns:
// {
//   padding: 16,
//   backgroundColor: { hex: '#3b82f6', rgb: {...}, hsl: {...} },
//   color: { hex: '#ffffff', rgb: {...}, hsl: {...} }
// }

// Responsive modifiers
tailwindToCSS('p-4 md:p-8 lg:p-12');
// Returns:
// {
//   padding: 16,
//   '(min-width: 768px)': { padding: 32 },
//   '(min-width: 1024px)': { padding: 48 }
// }

// Pseudo-class modifiers
tailwindToCSS('bg-blue-500 hover:bg-blue-600 focus:bg-blue-700');
// Returns:
// {
//   backgroundColor: { hex: '#3b82f6', ... },
//   ':hover': { backgroundColor: { hex: '#2563eb', ... } },
//   ':focus': { backgroundColor: { hex: '#1d4ed8', ... } }
// }

// Combined modifiers
tailwindToCSS('text-sm md:text-base lg:hover:text-lg');
// Returns:
// {
//   fontSize: '0.875rem',
//   lineHeight: '1.25rem',
//   '(min-width: 768px)': { fontSize: '1rem', lineHeight: '1.5rem' },
//   '(min-width: 1024px)': {
//     ':hover': { fontSize: '1.125rem', lineHeight: '1.75rem' }
//   }
// }

// Arbitrary values
tailwindToCSS('p-[20px] text-[#ff0000]');
// Returns:
// {
//   padding: '20px',
//   color: { hex: '#ff0000', ... }
// }
```

**Supported Modifiers:**

**Responsive breakpoints:**
- `sm:` - `(min-width: 640px)`
- `md:` - `(min-width: 768px)`
- `lg:` - `(min-width: 1024px)`
- `xl:` - `(min-width: 1280px)`
- `2xl:` - `(min-width: 1536px)`

**Pseudo-classes:**
- `hover:`, `focus:`, `active:`, `disabled:`, `visited:`, etc.

---

### `convertTailwindScaletoPixels`

Converts Tailwind CSS scale values to pixel values, percentages, or CSS keywords. Handles spacing scale, color values, and special Tailwind keywords.

**Signature:**
```typescript
function convertTailwindScaletoPixels(scale?: string): string | number | ColorObject | undefined
```

**Parameters:**
- `scale` (optional) - A Tailwind scale value (e.g., `'4'`, `'full'`, `'auto'`, `'blue-500'`)

**Returns:** The converted value in the appropriate format:
- Numbers (spacing) → pixels (multiplied by 4)
- Color names → ColorObject with hex, RGB, and HSL values
- Special keywords → CSS values
- Arbitrary values → parsed CSS values

**Example:**
```typescript
import { convertTailwindScaletoPixels } from '@reallygoodwork/coral-tw2css';

// Spacing scale (multiplied by 4)
convertTailwindScaletoPixels('4');
// Returns: 16

convertTailwindScaletoPixels('0.5');
// Returns: 2

convertTailwindScaletoPixels('px');
// Returns: 1

// Special keywords
convertTailwindScaletoPixels('full');
// Returns: '100%'

convertTailwindScaletoPixels('auto');
// Returns: 'auto'

convertTailwindScaletoPixels('min');
// Returns: 'min-content'

// Colors
convertTailwindScaletoPixels('blue-500');
// Returns: {
//   hex: '#3b82f6',
//   rgb: { r: 59, g: 130, b: 246, a: 1 },
//   hsl: { h: 217, s: 91, l: 60, a: 1 }
// }

convertTailwindScaletoPixels('white');
// Returns: {
//   hex: '#ffffff',
//   rgb: { r: 255, g: 255, b: 255, a: 1 },
//   hsl: { h: 0, s: 0, l: 100, a: 1 }
// }

// Arbitrary values
convertTailwindScaletoPixels('[10px_20px]');
// Returns: '10px 20px'

convertTailwindScaletoPixels('[calc(100%-20px)]');
// Returns: 'calc(100% - 20px)'

// Percentages
convertTailwindScaletoPixels('50%');
// Returns: '50%'
```

---

## Type Definitions

### `ColorObject`

Represents a color with multiple format representations.

```typescript
type ColorObject = {
  hex: string
  rgb: {
    r: number
    g: number
    b: number
    a: number
  }
  hsl: {
    h: number
    s: number
    l: number
    a: number
  }
}
```

### `Styles`

Base CSS properties supported by the converter.

```typescript
type Styles = {
  paddingInlineStart?: string
  paddingInlineEnd?: string
  paddingBlockStart?: string
  paddingBlockEnd?: string
  padding?: string
  marginInlineStart?: string
  marginInlineEnd?: string
  marginBlockStart?: string
  marginBlockEnd?: string
  margin?: string
  position?: string
  top?: string
  right?: string
  bottom?: string
  left?: string
  display?: string
  flexDirection?: string
  justifyContent?: string
  alignItems?: string
  flexWrap?: string
  gap?: string
  width?: string
  height?: string
  backgroundColor?: string | ColorObject
  color?: string | ColorObject
  fontSize?: string
  fontWeight?: string
  border?: string
  borderRadius?: string
  cursor?: string
  zIndex?: string
  overflow?: string
  boxShadow?: string
  transform?: string
  transition?: string
  opacity?: string
  // ... and many more CSS properties
}
```

### `StylesWithModifiers`

Extended styles object that includes nested responsive and pseudo-class styles.

```typescript
type StylesWithModifiers = Styles & {
  [key: string]: Styles | StylesWithModifiers
}
```

This allows for nested structures like:
```typescript
{
  padding: 16,
  '(min-width: 768px)': {
    padding: 32
  },
  ':hover': {
    backgroundColor: { hex: '#3b82f6', ... }
  }
}
```

---

## Supported Tailwind Classes

### Layout
- `container`, `box-border`, `box-content`, `block`, `inline-block`, `inline`, `flex`, `inline-flex`, `grid`, `inline-grid`, `hidden`
- `static`, `fixed`, `absolute`, `relative`, `sticky`
- `top-*`, `right-*`, `bottom-*`, `left-*`, `inset-*`
- `visible`, `invisible`, `collapse`
- `overflow-*`, `overscroll-*`
- `z-*`

### Flexbox & Grid
- `flex-row`, `flex-col`, `flex-wrap`, `flex-nowrap`
- `justify-*`, `items-*`, `self-*`, `content-*`
- `gap-*`, `gap-x-*`, `gap-y-*`
- `grid-cols-*`, `grid-rows-*`, `col-span-*`, `row-span-*`
- `grid-flow-*`, `auto-cols-*`, `auto-rows-*`
- `place-*`

### Spacing
- `p-*`, `px-*`, `py-*`, `pt-*`, `pr-*`, `pb-*`, `pl-*`
- `m-*`, `mx-*`, `my-*`, `mt-*`, `mr-*`, `mb-*`, `ml-*`
- `space-x-*`, `space-y-*`

### Sizing
- `w-*`, `h-*`, `min-w-*`, `min-h-*`, `max-w-*`, `max-h-*`
- `size-*` (for width and height together)

### Typography
- `font-*` (family, size, weight, style)
- `text-*` (size, color, alignment, decoration, transform, overflow)
- `leading-*`, `tracking-*`
- `line-clamp-*`
- `text-ellipsis`, `text-clip`, `truncate`
- `uppercase`, `lowercase`, `capitalize`, `normal-case`
- `italic`, `not-italic`
- `underline`, `line-through`, `no-underline`

### Backgrounds
- `bg-*` (color, gradient, size, position, repeat, attachment)
- `from-*`, `via-*`, `to-*` (gradient colors)

### Borders
- `border`, `border-*` (width, color, style, radius)
- `rounded-*`, `border-t-*`, `border-r-*`, `border-b-*`, `border-l-*`
- `divide-*`, `ring-*`, `outline-*`

### Effects
- `shadow-*`, `opacity-*`, `mix-blend-*`, `bg-blend-*`
- `blur-*`, `brightness-*`, `contrast-*`, `grayscale`, `hue-rotate-*`
- `invert`, `saturate-*`, `sepia`, `drop-shadow-*`, `backdrop-*`

### Transitions & Animation
- `transition-*`, `duration-*`, `ease-*`, `delay-*`
- `animate-*`

### Transforms
- `scale-*`, `rotate-*`, `translate-*`, `skew-*`
- `origin-*`

### Interactivity
- `cursor-*`, `pointer-events-*`, `resize-*`, `select-*`
- `scroll-*`, `touch-*`, `will-change-*`

### Accessibility
- `sr-only`, `not-sr-only`

---

## Color Palette

The package includes the full Tailwind CSS default color palette:

**Base colors:** `black`, `white`

**Color scales (50-900):**
- `slate`, `gray`, `zinc`, `neutral`, `stone`
- `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

Each color scale includes shades from 50 (lightest) to 900 (darkest).

---

## Usage Examples

### Basic Styling

```typescript
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css';

const buttonStyles = tailwindToCSS('px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600');

// Use in a React component with styled-components or emotion
const StyledButton = styled.button(buttonStyles);

// Or apply directly to an element
<div style={buttonStyles}>Button</div>
```

### Responsive Design

```typescript
const cardStyles = tailwindToCSS(`
  p-4 bg-white rounded-lg
  sm:p-6
  md:p-8
  lg:p-10
  xl:p-12
`);

// Results in:
// {
//   padding: 16,
//   backgroundColor: { hex: '#ffffff', ... },
//   borderRadius: '0.5rem',
//   '(min-width: 640px)': { padding: 24 },
//   '(min-width: 768px)': { padding: 32 },
//   '(min-width: 1024px)': { padding: 40 },
//   '(min-width: 1280px)': { padding: 48 }
// }
```

### Interactive States

```typescript
const linkStyles = tailwindToCSS(`
  text-blue-600 underline
  hover:text-blue-800
  focus:outline-none focus:ring-2 focus:ring-blue-500
  active:text-blue-900
`);
```

### Complex Layouts

```typescript
const gridStyles = tailwindToCSS(`
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
`);
```

### Converting Individual Scale Values

```typescript
import { convertTailwindScaletoPixels } from '@reallygoodwork/coral-tw2css';

// In custom logic
const spacing = convertTailwindScaletoPixels('8'); // 32
const color = convertTailwindScaletoPixels('indigo-600');
// { hex: '#4f46e5', rgb: {...}, hsl: {...} }
```

---

## Integration Examples

### With React

```typescript
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css';

function Button({ variant = 'primary', children }) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const styles = tailwindToCSS(`${baseStyles} ${variantStyles[variant]}`);

  return <button style={styles}>{children}</button>;
}
```

### With Styled Components

```typescript
import styled from 'styled-components';
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css';

const Card = styled.div(tailwindToCSS(`
  bg-white rounded-xl shadow-lg p-6
  hover:shadow-xl transition-shadow
  md:p-8
`));
```

### With Emotion

```typescript
import { css } from '@emotion/react';
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css';

const buttonCss = css(tailwindToCSS('px-6 py-3 bg-green-500 text-white rounded-md'));
```

---

## Advanced Features

### Screen Reader Only Utilities

```typescript
tailwindToCSS('sr-only');
// Returns:
// {
//   position: 'absolute',
//   width: 1,
//   height: 1,
//   padding: 0,
//   margin: -1,
//   overflow: 'hidden',
//   clip: 'rect(0, 0, 0, 0)',
//   whiteSpace: 'nowrap',
//   border: 0
// }
```

### Arbitrary Values

```typescript
tailwindToCSS('w-[calc(100%-2rem)] text-[#1a1a1a] p-[1.5rem_2rem]');
// Returns:
// {
//   width: 'calc(100% - 2rem)',
//   color: { hex: '#1a1a1a', ... },
//   padding: '1.5rem 2rem'
// }
```

### Font Size with Line Height

```typescript
tailwindToCSS('text-lg/8');
// Returns:
// {
//   fontSize: '1.125rem',
//   lineHeight: '2rem'
// }
```

---

## Limitations

- Not all Tailwind utilities are supported (focus on the most common ones)
- Some complex Tailwind features like `@apply` directives are not supported
- Gradient utilities have partial support
- Some newer Tailwind v4 features may not be available

---

## Dependencies

- `colord` - Color manipulation and conversion library

---

## Related Packages

- `@reallygoodwork/coral-core` - Core utilities and types for Coral
- `@reallygoodwork/coral-to-html` - Convert Coral specs to HTML
- `@reallygoodwork/coral-to-react` - Convert Coral specs to React components
- `@reallygoodwork/react-to-coral` - Convert React components to Coral specs
- `@reallygoodwork/style-to-tailwind` - Convert CSS styles to Tailwind classes

---

## License

MIT
