# @reallygoodwork/coral-core

Core types, schemas, and utilities for the Coral UI specification format.

[![npm](https://img.shields.io/npm/v/@reallygoodwork/coral-core)](https://www.npmjs.com/package/@reallygoodwork/coral-core)

## Installation

```bash
npm install @reallygoodwork/coral-core
# or
pnpm add @reallygoodwork/coral-core
# or
yarn add @reallygoodwork/coral-core
```

## Overview

This package provides the foundational types, Zod schemas, and utility functions for working with the Coral UI specification format. It's required by all other Coral packages.

## API Reference

### Functions

#### `parseUISpec(spec)`

Parses and validates a UI specification object against the Coral schema.

```typescript
import { parseUISpec } from '@reallygoodwork/coral-core'

const spec = {
  elementType: 'div',
  styles: { padding: '20px' },
  children: [
    { elementType: 'p', textContent: 'Hello World' }
  ]
}

const validatedSpec = await parseUISpec(spec)
```

**Parameters:**
- `spec: Record<string, unknown>` - The UI specification object to parse

**Returns:**
- `Promise<CoralRootNode>` - The validated Coral specification

**Throws:**
- `Error` if the specification fails validation

---

#### `transformHTMLToSpec(html)`

Transforms an HTML string into a Coral specification.

```typescript
import { transformHTMLToSpec } from '@reallygoodwork/coral-core'

const html = `
<div class="container">
  <h1 style="color: blue;">Hello World</h1>
  <p>Welcome to Coral</p>
</div>
`

const spec = transformHTMLToSpec(html)
```

**Parameters:**
- `html: string` - HTML string to transform

**Returns:**
- `CoralRootNode` - The Coral specification

**Features:**
- Extracts inline styles
- Parses CSS from `<style>` tags
- Handles responsive media queries
- Preserves element attributes

---

#### `dimensionToCSS(dimension)`

Converts a Coral dimension object to a CSS string.

```typescript
import { dimensionToCSS } from '@reallygoodwork/coral-core'

dimensionToCSS({ value: 16, unit: 'px' })  // "16px"
dimensionToCSS({ value: 2, unit: 'rem' })  // "2rem"
dimensionToCSS({ value: 50, unit: '%' })   // "50%"
```

**Parameters:**
- `dimension: Dimension` - Object with `value` (number) and `unit` (string)

**Returns:**
- `string` - CSS dimension string

---

#### `normalizeDimension(value)`

Normalizes various dimension inputs to a standard Dimension object.

```typescript
import { normalizeDimension } from '@reallygoodwork/coral-core'

normalizeDimension('16px')  // { value: 16, unit: 'px' }
normalizeDimension(16)      // { value: 16, unit: 'px' }
normalizeDimension('2rem')  // { value: 2, unit: 'rem' }
```

**Parameters:**
- `value: string | number` - The dimension value to normalize

**Returns:**
- `Dimension` - Normalized dimension object

---

#### `pascalCaseString(str)`

Converts a string to PascalCase.

```typescript
import { pascalCaseString } from '@reallygoodwork/coral-core'

pascalCaseString('hello-world')  // "HelloWorld"
pascalCaseString('my_component') // "MyComponent"
```

---

### Media Query Functions

#### `parseMediaQuery(mediaQueryString)`

Parses a CSS media query string and extracts breakpoint information.

```typescript
import { parseMediaQuery } from '@reallygoodwork/coral-core'

// Simple breakpoint
parseMediaQuery('@media (min-width: 768px)')
// { type: 'min-width', value: '768px' }

// Range breakpoint
parseMediaQuery('@media (min-width: 768px) and (max-width: 1024px)')
// { min: { type: 'min-width', value: '768px' }, max: { type: 'max-width', value: '1024px' } }
```

---

#### `extractMediaQueriesFromCSS(cssString, selector?)`

Extracts media queries and their associated styles from a CSS string.

```typescript
import { extractMediaQueriesFromCSS } from '@reallygoodwork/coral-core'

const css = `
  @media (min-width: 768px) {
    .container { padding: 20px; }
  }
`

const mediaQueries = extractMediaQueriesFromCSS(css)
// [{ mediaQuery: '@media (min-width: 768px) [.container]', styles: { padding: '20px' } }]
```

---

#### `mediaQueriesToResponsiveStyles(mediaQueries)`

Converts parsed media queries to Coral ResponsiveStyle format.

```typescript
import { mediaQueriesToResponsiveStyles } from '@reallygoodwork/coral-core'

const mediaQueries = [
  { mediaQuery: '@media (min-width: 768px)', styles: { padding: '20px' } }
]

const responsiveStyles = mediaQueriesToResponsiveStyles(mediaQueries)
// [{ breakpoint: { type: 'min-width', value: '768px' }, styles: { padding: '20px' } }]
```

---

#### `extractResponsiveStylesFromObject(stylesObject)`

Extracts responsive styles from an object with media query keys.

```typescript
import { extractResponsiveStylesFromObject } from '@reallygoodwork/coral-core'

const styles = {
  padding: '10px',
  '(min-width: 768px)': { padding: '20px' },
  '(min-width: 1024px)': { padding: '40px' }
}

const { baseStyles, responsiveStyles } = extractResponsiveStylesFromObject(styles)
// baseStyles: { padding: '10px' }
// responsiveStyles: [{ breakpoint: {...}, styles: { padding: '20px' } }, ...]
```

---

## Types

### Core Types

```typescript
// Main specification types
type CoralRootNode = CoralNode & {
  $schema?: string
  componentName?: string
  imports?: CoralImportType[]
  // ... additional root-level properties
}

type CoralNode = {
  type?: 'COMPONENT' | 'INSTANCE' | 'COMPONENT_SET' | 'NODE'
  name?: string
  elementType: CoralElementType
  textContent?: string
  children?: CoralNode[]
  styles?: CoralStyleType
  elementAttributes?: Record<string, string | number | boolean | string[]>
  componentProperties?: CoralComponentPropertyType
  responsiveStyles?: ResponsiveStyle[]
  variants?: CoralNode[]
  // ... additional properties
}

// Element types
type CoralElementType =
  | 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'a' | 'button' | 'input' | 'form' | 'img' | 'ul' | 'li' | 'ol'
  | 'nav' | 'header' | 'footer' | 'section' | 'article' | 'aside'
  | 'table' | 'tr' | 'td' | 'th' | 'thead' | 'tbody'
  | 'svg' | 'path' | 'circle' | 'rect' | 'g'
  // ... and more

// Dimension type
type Dimension = {
  value: number
  unit: DimensionUnit
}

type DimensionUnit = 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh' | 'vmin' | 'vmax' | 'ch' | 'ex' | 'cm' | 'mm' | 'in' | 'pt' | 'pc'

// Responsive styles
type ResponsiveStyle = {
  breakpoint: SimpleBreakpoint | RangeBreakpoint
  styles: Record<string, any>
}

type SimpleBreakpoint = {
  type: 'min-width' | 'max-width' | 'min-height' | 'max-height'
  value: string
}

type RangeBreakpoint = {
  min?: SimpleBreakpoint
  max?: SimpleBreakpoint
}
```

### Additional Types

```typescript
// Component properties
type CoralComponentPropertyType = Record<string, {
  type: CoralTSTypes | string
  value: any
  optional?: boolean
  description?: string
}>

// State hooks
type CoralStateType = {
  name: string
  setter: string
  initialValue: any
  type?: string
}

// Methods
type CoralMethodType = {
  name: string
  parameters: string[]
  body?: string
  returnType?: string
}

// Imports
type CoralImportType = {
  source: string
  specifiers: Array<{
    name: string
    isDefault?: boolean
    as?: string
  }>
  version?: string
}

// Colors
type CoralColorType = {
  hex: string
  rgb: { r: number; g: number; b: number; a: number }
  hsl: { h: number; s: number; l: number; a: number }
}
```

## Related Packages

- [@reallygoodwork/coral-tw2css](https://www.npmjs.com/package/@reallygoodwork/coral-tw2css) - Convert Tailwind to CSS
- [@reallygoodwork/react-to-coral](https://www.npmjs.com/package/@reallygoodwork/react-to-coral) - React to Coral
- [@reallygoodwork/coral-to-react](https://www.npmjs.com/package/@reallygoodwork/coral-to-react) - Coral to React
- [@reallygoodwork/coral-to-html](https://www.npmjs.com/package/@reallygoodwork/coral-to-html) - Coral to HTML

## License

MIT © [Really Good Work](https://reallygoodwork.com)
