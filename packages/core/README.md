# @reallygoodwork/coral-core

Core utilities and type definitions for the Coral specification format. This package provides the foundational types, schemas, and utility functions for working with Coral UI specifications.

## Installation

```bash
npm install @reallygoodwork/coral-core
```

```bash
pnpm add @reallygoodwork/coral-core
```

```bash
yarn add @reallygoodwork/coral-core
```

## What is Coral?

Coral is a specification format for describing UI components in a framework-agnostic way. It enables you to define component structure, styling, interactivity, and responsive behavior in a portable JSON format that can be transformed into various output formats (HTML, React, Vue, etc.).

## Features

- **Type-safe schemas** using Zod for runtime validation
- **Responsive design** support with breakpoint definitions
- **HTML parsing** to convert HTML strings into Coral specifications
- **Dimension utilities** for handling CSS units
- **Media query parsing** for extracting and working with responsive styles
- **TypeScript-first** with comprehensive type definitions

---

## Functions

### `dimensionToCSS`

Converts a dimension object or number to a CSS string.

**Signature:**
```typescript
function dimensionToCSS(dimension: Dimension): string
```

**Parameters:**
- `dimension` - A dimension value (number or dimension object)

**Returns:** CSS string representation (e.g., `"16px"`, `"2rem"`)

**Example:**
```typescript
import { dimensionToCSS } from '@reallygoodwork/coral-core';

dimensionToCSS(16); // "16px"
dimensionToCSS({ value: 2, unit: 'rem' }); // "2rem"
dimensionToCSS({ value: 50, unit: '%' }); // "50%"
```

---

### `parseMediaQuery`

Parses a CSS media query string and extracts breakpoint information. Supports min-width, max-width, min-height, max-height, and range queries.

**Signature:**
```typescript
function parseMediaQuery(
  mediaQueryString: string
): { type: BreakpointType; value: string } | RangeBreakpoint | null
```

**Parameters:**
- `mediaQueryString` - A CSS media query string (e.g., `"@media (min-width: 768px)"`)

**Returns:** Breakpoint information or `null` if parsing fails

**Example:**
```typescript
import { parseMediaQuery } from '@reallygoodwork/coral-core';

// Simple breakpoint
parseMediaQuery('@media (min-width: 768px)');
// { type: 'min-width', value: '768px' }

// Range breakpoint
parseMediaQuery('@media (min-width: 768px) and (max-width: 1024px)');
// { min: { type: 'min-width', value: '768px' }, max: { type: 'max-width', value: '1024px' } }

// With media type (ignored)
parseMediaQuery('@media screen and (min-width: 768px)');
// { type: 'min-width', value: '768px' }
```

---

### `extractMediaQueriesFromCSS`

Extracts media queries and their associated styles from a CSS string.

**Signature:**
```typescript
function extractMediaQueriesFromCSS(
  cssString: string,
  selector?: string
): Array<{ mediaQuery: string; styles: Record<string, string> }>
```

**Parameters:**
- `cssString` - A CSS string containing media queries
- `selector` (optional) - A specific selector to filter styles for

**Returns:** Array of media query definitions with their styles

**Example:**
```typescript
import { extractMediaQueriesFromCSS } from '@reallygoodwork/coral-core';

const css = `
  .container { padding: 10px; }
  @media (min-width: 768px) {
    .container { padding: 20px; }
  }
`;

extractMediaQueriesFromCSS(css, '.container');
// [{ mediaQuery: '@media (min-width: 768px)', styles: { padding: '20px' } }]
```

---

### `mediaQueriesToResponsiveStyles`

Converts parsed media queries to Coral ResponsiveStyle format.

**Signature:**
```typescript
function mediaQueriesToResponsiveStyles(
  mediaQueries: Array<{ mediaQuery: string; styles: Record<string, string> }>
): ResponsiveStyle[]
```

**Parameters:**
- `mediaQueries` - Array of media query objects

**Returns:** Array of ResponsiveStyle objects

**Example:**
```typescript
import { mediaQueriesToResponsiveStyles } from '@reallygoodwork/coral-core';

const mediaQueries = [
  { mediaQuery: '@media (min-width: 768px)', styles: { padding: '20px' } }
];

mediaQueriesToResponsiveStyles(mediaQueries);
// [{ breakpoint: { type: 'min-width', value: '768px' }, styles: { padding: '20px' } }]
```

---

### `extractResponsiveStylesFromObject`

Extracts responsive styles from an object with media query keys. Supports both standard CSS format and Tailwind format.

**Signature:**
```typescript
function extractResponsiveStylesFromObject(
  stylesObject: Record<string, any>
): {
  baseStyles: Record<string, any>
  responsiveStyles: ResponsiveStyle[]
}
```

**Parameters:**
- `stylesObject` - Object with style properties, potentially including media query keys

**Returns:** Object containing separated base styles and responsive styles

**Example:**
```typescript
import { extractResponsiveStylesFromObject } from '@reallygoodwork/coral-core';

// Standard format
extractResponsiveStylesFromObject({
  padding: '10px',
  '@media (min-width: 768px)': { padding: '20px' }
});

// Tailwind format
extractResponsiveStylesFromObject({
  padding: '10px',
  '(min-width: 768px)': { padding: '20px' }
});

// Both return:
// {
//   baseStyles: { padding: '10px' },
//   responsiveStyles: [{ breakpoint: { type: 'min-width', value: '768px' }, styles: { padding: '20px' } }]
// }
```

---

### `parseUISpec`

Parses and validates a UI specification object against the Coral schema.

**Signature:**
```typescript
async function parseUISpec(
  html: Record<string, unknown>
): Promise<CoralRootNode>
```

**Parameters:**
- `html` - The UI specification object to parse

**Returns:** Promise resolving to validated CoralRootNode

**Throws:** Error if validation fails

**Example:**
```typescript
import { parseUISpec } from '@reallygoodwork/coral-core';

const spec = {
  name: 'Button',
  elementType: 'button',
  styles: { padding: '10px', backgroundColor: '#007bff' },
  textContent: 'Click me'
};

const validatedSpec = await parseUISpec(spec);
```

---

### `pascalCaseString`

Converts a string to PascalCase.

**Signature:**
```typescript
function pascalCaseString(str: string): PascalCase<string>
```

**Parameters:**
- `str` - The string to convert

**Returns:** PascalCase version of the input string

**Example:**
```typescript
import { pascalCaseString } from '@reallygoodwork/coral-core';

pascalCaseString('hello world'); // "HelloWorld"
pascalCaseString('my-component-name'); // "MyComponentName"
pascalCaseString('user_profile'); // "UserProfile"
```

---

### `transformHTMLToSpec`

Transforms an HTML string into a Coral specification. Extracts styles from `<style>` tags and converts the HTML structure to Coral nodes.

**Signature:**
```typescript
function transformHTMLToSpec(html: string): CoralRootNode
```

**Parameters:**
- `html` - HTML string to transform

**Returns:** CoralRootNode representing the HTML structure

**Throws:** Error if HTML is invalid or empty

**Example:**
```typescript
import { transformHTMLToSpec } from '@reallygoodwork/coral-core';

const html = `
  <div class="container" style="padding: 20px;">
    <h1>Hello World</h1>
    <p>This is a paragraph.</p>
  </div>
`;

const spec = transformHTMLToSpec(html);
```

---

### `normalizeDimension`

Helper function to normalize a dimension to the object format.

**Signature:**
```typescript
function normalizeDimension(dimension: Dimension): {
  value: number
  unit: DimensionUnit
}
```

**Parameters:**
- `dimension` - A dimension value (number or dimension object)

**Returns:** Normalized dimension object

**Example:**
```typescript
import { normalizeDimension } from '@reallygoodwork/coral-core';

normalizeDimension(16); // { value: 16, unit: 'px' }
normalizeDimension({ value: 2, unit: 'rem' }); // { value: 2, unit: 'rem' }
```

---

## Type Exports

### Core Types

#### `CoralNode`

Represents a single node in the Coral specification tree.

```typescript
type CoralNode = {
  // Identification
  name: string
  figmaNodeRef?: string
  figmaType?: string
  componentParentFigmaNodeRef?: string

  // Element configuration
  elementType: CoralElementType
  elementAttributes?: Record<string, string | number | boolean | string[]>

  // Content
  textContent?: string
  description?: string

  // Styling
  styles?: CoralStyleType
  responsiveStyles?: CoralResponsiveStyles
  hasBackgroundImage?: boolean

  // Component metadata
  type?: 'COMPONENT' | 'INSTANCE' | 'COMPONENT_SET' | 'NODE'
  isComponentInstance?: boolean
  tsType?: string

  // Variants
  options?: Record<string, unknown> | null
  variantProperties?: Record<string, {
    type: CoralTSTypes | CoralTSTypes[]
    value: unknown
  }>

  // Tree structure
  children?: CoralNode[] | null
  variants?: CoralNode[] | null
}
```

#### `CoralRootNode`

Extends CoralNode with additional root-level properties.

```typescript
type CoralRootNode = CoralNode & {
  $schema?: 'https://coral.design/schema.json'
  componentName?: string
  componentProperties?: CoralComponentPropertyType
  config?: Record<string, unknown> | null
  dependencies?: CoralDependencyType[]
  designTokens?: Record<string, CoralDesignTokenType>
  imports?: CoralImportType[]
  isComponentSet?: boolean
  methods?: CoralMethodType[]
  stateHooks?: CoralStateType[]
  numberOfVariants?: number
}
```

---

### Style Types

#### `CoralStyleType`

Represents the styles of a Coral component. Can contain nested styles for pseudo-selectors or other nested contexts.

```typescript
type CoralStyleType = Record<
  string,
  | string
  | number
  | CoralColorType
  | CoralGradientType
  | Dimension
  | Record<string, any>
>
```

#### `CoralColorType`

Represents a color with hex, RGB, and HSL values.

```typescript
type CoralColorType = {
  hex: string
  rgb: {
    r: number  // 0-255
    g: number  // 0-255
    b: number  // 0-255
    a: number  // 0-1
  }
  hsl: {
    h: number  // 0-360
    s: number  // 0-100
    l: number  // 0-100
    a: number  // 0-1
  }
}
```

#### `CoralGradientType`

Represents a gradient definition.

```typescript
type CoralGradientType = {
  angle: number
  type: 'linear' | 'radial' | 'LINEAR' | 'RADIAL'
  colors: Array<{
    color: CoralColorType
    position: number
  }>
}
```

---

### Dimension Types

#### `Dimension`

A dimension value with unit. Can be either a number (interpreted as pixels) or an object with value and unit.

```typescript
type Dimension = number | {
  value: number
  unit: DimensionUnit
}
```

#### `DimensionUnit`

Supported CSS unit types.

```typescript
type DimensionUnit =
  | 'px' | 'em' | 'rem'
  | 'vw' | 'vh' | 'vmin' | 'vmax'
  | '%' | 'ch' | 'ex'
  | 'cm' | 'mm' | 'in' | 'pt' | 'pc'
```

---

### Responsive Types

#### `BreakpointType`

Type of media query condition.

```typescript
type BreakpointType = 'min-width' | 'max-width' | 'min-height' | 'max-height'
```

#### `SimpleBreakpoint`

A simple breakpoint with a single condition.

```typescript
type SimpleBreakpoint = {
  type: BreakpointType
  value: string
}
```

#### `RangeBreakpoint`

A range breakpoint with min and/or max conditions.

```typescript
type RangeBreakpoint = {
  min?: {
    type: 'min-width' | 'min-height'
    value: string
  }
  max?: {
    type: 'max-width' | 'max-height'
    value: string
  }
}
```

#### `Breakpoint`

Union of simple and range breakpoints.

```typescript
type Breakpoint = SimpleBreakpoint | RangeBreakpoint
```

#### `ResponsiveStyle`

A set of styles to apply at a specific breakpoint.

```typescript
type ResponsiveStyle = {
  breakpoint: Breakpoint
  label?: string
  styles: CoralStyleType
}
```

#### `CoralResponsiveStyles`

Array of responsive style definitions.

```typescript
type CoralResponsiveStyles = ResponsiveStyle[] | undefined
```

---

### Component Types

#### `CoralComponentPropertyType`

Properties passed to a component.

```typescript
type CoralComponentPropertyType = Record<
  string,
  | unknown
  | {
      type: CoralTSTypes | CoralTSTypes[]
      options?: Record<string, unknown> | null
      defaultValue: unknown
    }
  | {
      type: CoralTSTypes | CoralTSTypes[]
      value: unknown
    }
>
```

#### `CoralMethodType`

Represents a method in a Coral component.

```typescript
type CoralMethodType = {
  name: string
  description?: string | null
  body: string
  parameters: Array<
    | string
    | {
        name: string
        tsType?: CoralTSTypes | CoralTSTypes[] | null
        defaultValue?: any
      }
  >
  stateInteractions?: {
    reads: string[]
    writes: string[]
  } | null
}
```

#### `CoralStateType`

Represents state in a Coral component (React hooks).

```typescript
type CoralStateType = {
  name: string
  setterName: string
  initialValue?: unknown | null
  tsType: CoralTSTypes | CoralTSTypes[]
  hookType?: 'useState' | 'useEffect' | 'useReducer' | 'useContext' | 'useMemo' | 'useCallback'
  dependencies?: string
  reducer?: string
}
```

#### `CoralImportType`

Represents an import statement.

```typescript
type CoralImportType = {
  source: string
  version: string  // default: 'latest'
  specifiers: Array<{
    name: string
    isDefault?: boolean
    as?: string
  }>
}
```

---

### Utility Types

#### `CoralElementType`

Supported HTML element types.

```typescript
type CoralElementType =
  | 'div' | 'span' | 'p' | 'a' | 'button' | 'input' | 'form'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'ul' | 'ol' | 'li' | 'dl' | 'dt' | 'dd'
  | 'nav' | 'header' | 'footer' | 'section' | 'article' | 'aside' | 'main'
  | 'table' | 'tr' | 'td' | 'th' | 'thead' | 'tbody' | 'tfoot' | 'caption'
  | 'img' | 'video' | 'audio' | 'source' | 'canvas'
  | 'svg' | 'circle' | 'rect' | 'path' | 'ellipse' | 'polygon' | 'line' | 'polyline' | 'g' | 'defs' | 'use'
  | 'textarea' | 'select' | 'option' | 'label' | 'fieldset' | 'legend'
  | 'figure' | 'figcaption' | 'time' | 'hr' | 'br'
  | 'strong' | 'em' | 'code' | 'pre' | 'blockquote'
  | 'b' | 'i' | 'u' | 's' | 'small' | 'mark' | 'abbr' | 'cite' | 'kbd' | 'samp' | 'var' | 'sub' | 'sup'
  | 'text'
```

#### `CoralTSTypes`

TypeScript type identifiers for component properties.

```typescript
type CoralTSTypes =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | 'undefined'
  | 'function'
  | null
```

#### `CoralVariantType`

Represents a component variant.

```typescript
type CoralVariantType = {
  name: string
  figmaNodeRef?: string | null
  options?: Record<string, any> | null
  styles?: CoralStyleType | null
}
```

#### `CoralDependencyType`

Represents a dependency on another Coral document.

```typescript
type CoralDependencyType = {
  name: string
  version: string
  path: string
}
```

#### `CoralDesignTokenType`

Represents a design token following the W3C Community Group specification.

```typescript
type CoralDesignTokenType = {
  $type: string
  $value: number | string | Record<string, unknown>
  $description?: string
}
```

---

## Usage Examples

### Creating a Coral Specification

```typescript
import type { CoralRootNode } from '@reallygoodwork/coral-core';

const buttonSpec: CoralRootNode = {
  name: 'PrimaryButton',
  elementType: 'button',
  componentName: 'PrimaryButton',
  styles: {
    padding: { value: 12, unit: 'px' },
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderRadius: { value: 4, unit: 'px' },
    border: 'none',
    cursor: 'pointer'
  },
  responsiveStyles: [
    {
      breakpoint: { type: 'min-width', value: '768px' },
      styles: {
        padding: { value: 16, unit: 'px' }
      }
    }
  ],
  textContent: 'Click me'
};
```

### Parsing and Validating

```typescript
import { parseUISpec } from '@reallygoodwork/coral-core';

async function loadAndValidateSpec(rawSpec: Record<string, unknown>) {
  try {
    const validSpec = await parseUISpec(rawSpec);
    console.log('Valid spec:', validSpec);
  } catch (error) {
    console.error('Invalid spec:', error);
  }
}
```

### Working with Responsive Styles

```typescript
import { extractResponsiveStylesFromObject } from '@reallygoodwork/coral-core';

const styles = {
  padding: '10px',
  fontSize: '14px',
  '@media (min-width: 768px)': {
    padding: '20px',
    fontSize: '16px'
  },
  '@media (min-width: 1024px)': {
    padding: '30px',
    fontSize: '18px'
  }
};

const { baseStyles, responsiveStyles } = extractResponsiveStylesFromObject(styles);
console.log('Base:', baseStyles);
console.log('Responsive:', responsiveStyles);
```

### Converting HTML to Coral

```typescript
import { transformHTMLToSpec } from '@reallygoodwork/coral-core';

const html = `
  <style>
    .card { padding: 20px; }
    @media (min-width: 768px) {
      .card { padding: 40px; }
    }
  </style>
  <div class="card">
    <h2>Card Title</h2>
    <p>Card content goes here.</p>
  </div>
`;

const coralSpec = transformHTMLToSpec(html);
```

---

## License

MIT

## Related Packages

- `@reallygoodwork/coral-to-html` - Convert Coral specs to HTML
- `@reallygoodwork/coral-to-react` - Convert Coral specs to React components
- `@reallygoodwork/react-to-coral` - Convert React components to Coral specs
- `@reallygoodwork/style-to-tailwind` - Convert styles to Tailwind classes
- `@reallygoodwork/coral-tw2css` - Convert Tailwind classes to CSS
