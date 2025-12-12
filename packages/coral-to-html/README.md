# @reallygoodwork/coral-to-html

Convert Coral specifications to HTML markup. This package transforms Coral JSON specifications into clean, formatted HTML with inline styles.

## Installation

```bash
npm install @reallygoodwork/coral-to-html
```

```bash
pnpm add @reallygoodwork/coral-to-html
```

```bash
yarn add @reallygoodwork/coral-to-html
```

## Features

- **HTML Generation** - Convert Coral specs to semantic HTML
- **Inline Styles** - Automatic conversion of Coral styles to CSS inline styles
- **Automatic Formatting** - Beautiful, formatted HTML output via Prettier
- **Self-Closing Tags** - Proper handling of void elements (img, br, hr, etc.)
- **Attribute Conversion** - Convert element attributes to HTML attributes
- **Color Support** - Convert Coral color objects to hex values
- **Dimension Support** - Convert dimension objects to CSS units
- **Nested Elements** - Full support for nested component structures
- **Text Content** - Preserve text content in elements

---

## Functions

### `coralToHTML`

Converts a Coral specification to formatted HTML markup.

**Signature:**
```typescript
async function coralToHTML(coralSpec: CoralRootNode): Promise<string>
```

**Parameters:**
- `coralSpec` - A Coral root node specification

**Returns:** Promise resolving to formatted HTML string

**Example:**
```typescript
import { coralToHTML } from '@reallygoodwork/coral-to-html';
import type { CoralRootNode } from '@reallygoodwork/coral-core';

const spec: CoralRootNode = {
  name: 'card',
  elementType: 'div',
  styles: {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  children: [
    {
      name: 'title',
      elementType: 'h2',
      textContent: 'Card Title',
      styles: {
        fontSize: '24px',
        marginBottom: '10px',
        color: '#333'
      }
    },
    {
      name: 'content',
      elementType: 'p',
      textContent: 'This is the card content.',
      styles: {
        fontSize: '16px',
        color: '#666'
      }
    }
  ]
};

const html = await coralToHTML(spec);
console.log(html);
```

**Output:**
```html
<div
  style="padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1)"
>
  <h2 style="font-size: 24px; margin-bottom: 10px; color: #333">
    Card Title
  </h2>
  <p style="font-size: 16px; color: #666">
    This is the card content.
  </p>
</div>
```

---

## Style Conversion

The package automatically converts various Coral style formats to CSS:

### Dimension Objects

Coral dimension objects are converted to CSS values:

```typescript
// Coral
{
  padding: { value: 20, unit: 'px' },
  width: { value: 50, unit: '%' }
}

// HTML
style="padding: 20px; width: 50%"
```

### Numeric Values

Numeric values are automatically converted to pixels (except for specific properties):

```typescript
// Coral
{
  padding: 20,
  fontSize: 16,
  fontWeight: 700  // Remains unitless
}

// HTML
style="padding: 20px; font-size: 16px; font-weight: 700"
```

### Color Objects

Coral color objects are converted to hex values:

```typescript
// Coral
{
  backgroundColor: {
    hex: '#007bff',
    rgb: { r: 0, g: 123, b: 255, a: 1 },
    hsl: { h: 211, s: 100, l: 50, a: 1 }
  }
}

// HTML
style="background-color: #007bff"
```

### String Values

String values are passed through directly:

```typescript
// Coral
{
  display: 'flex',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}

// HTML
style="display: flex; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1)"
```

### CamelCase to Kebab-Case

CSS property names are automatically converted:

```typescript
// Coral (camelCase)
{
  backgroundColor: '#fff',
  fontSize: '16px',
  borderRadius: '4px'
}

// HTML (kebab-case)
style="background-color: #fff; font-size: 16px; border-radius: 4px"
```

---

## Element Attributes

### Basic Attributes

Element attributes are converted to HTML attributes:

```typescript
const spec = {
  name: 'link',
  elementType: 'a',
  elementAttributes: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer'
  },
  textContent: 'Visit Example'
};

// Output:
// <a href="https://example.com" target="_blank" rel="noopener noreferrer">
//   Visit Example
// </a>
```

### Boolean Attributes

Boolean attributes are handled correctly:

```typescript
const spec = {
  name: 'input',
  elementType: 'input',
  elementAttributes: {
    type: 'checkbox',
    checked: true,
    disabled: false
  }
};

// Output:
// <input type="checkbox" checked />
// (disabled is omitted because it's false)
```

### Array Attributes

Array values are joined with spaces:

```typescript
const spec = {
  name: 'div',
  elementType: 'div',
  elementAttributes: {
    class: ['container', 'mx-auto', 'p-4']
  }
};

// Output:
// <div class="container mx-auto p-4"></div>
```

---

## Self-Closing Tags

The package properly handles void/self-closing HTML elements:

```typescript
const imageSpec = {
  name: 'image',
  elementType: 'img',
  elementAttributes: {
    src: '/image.jpg',
    alt: 'Description'
  },
  styles: {
    width: '100%',
    borderRadius: '8px'
  }
};

const html = await coralToHTML(imageSpec);
// Output:
// <img src="/image.jpg" alt="Description" style="width: 100%; border-radius: 8px" />
```

**Supported self-closing tags:**
- `area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`

---

## Usage Examples

### Simple Button

```typescript
import { coralToHTML } from '@reallygoodwork/coral-to-html';

const buttonSpec = {
  name: 'button',
  elementType: 'button',
  textContent: 'Click Me',
  styles: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

const html = await coralToHTML(buttonSpec);
```

**Output:**
```html
<button
  style="padding: 10px 20px; background-color: #007bff; color: #ffffff; border: none; border-radius: 4px; cursor: pointer"
>
  Click Me
</button>
```

### Card Component

```typescript
const cardSpec = {
  name: 'card',
  elementType: 'div',
  styles: {
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  children: [
    {
      name: 'image',
      elementType: 'img',
      elementAttributes: {
        src: '/product.jpg',
        alt: 'Product'
      },
      styles: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '8px',
        marginBottom: '16px'
      }
    },
    {
      name: 'title',
      elementType: 'h3',
      textContent: 'Product Name',
      styles: {
        fontSize: '20px',
        fontWeight: 600,
        marginBottom: '8px',
        color: '#333'
      }
    },
    {
      name: 'description',
      elementType: 'p',
      textContent: 'Product description goes here.',
      styles: {
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.5'
      }
    },
    {
      name: 'price',
      elementType: 'p',
      textContent: '$99.99',
      styles: {
        fontSize: '18px',
        fontWeight: 700,
        color: '#007bff',
        marginTop: '12px'
      }
    }
  ]
};

const html = await coralToHTML(cardSpec);
```

### Form Elements

```typescript
const formSpec = {
  name: 'form',
  elementType: 'form',
  elementAttributes: {
    action: '/submit',
    method: 'POST'
  },
  styles: {
    maxWidth: '400px',
    margin: '0 auto'
  },
  children: [
    {
      name: 'label',
      elementType: 'label',
      elementAttributes: {
        for: 'email'
      },
      textContent: 'Email:',
      styles: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 600
      }
    },
    {
      name: 'input',
      elementType: 'input',
      elementAttributes: {
        type: 'email',
        id: 'email',
        name: 'email',
        required: true
      },
      styles: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginBottom: '16px'
      }
    },
    {
      name: 'submit',
      elementType: 'button',
      elementAttributes: {
        type: 'submit'
      },
      textContent: 'Submit',
      styles: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }
    }
  ]
};

const html = await coralToHTML(formSpec);
```

### Navigation Menu

```typescript
const navSpec = {
  name: 'nav',
  elementType: 'nav',
  styles: {
    backgroundColor: '#333',
    padding: '16px'
  },
  children: [
    {
      name: 'list',
      elementType: 'ul',
      styles: {
        display: 'flex',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        gap: '24px'
      },
      children: [
        {
          name: 'item1',
          elementType: 'li',
          children: [
            {
              name: 'link1',
              elementType: 'a',
              elementAttributes: {
                href: '/'
              },
              textContent: 'Home',
              styles: {
                color: '#fff',
                textDecoration: 'none'
              }
            }
          ]
        },
        {
          name: 'item2',
          elementType: 'li',
          children: [
            {
              name: 'link2',
              elementType: 'a',
              elementAttributes: {
                href: '/about'
              },
              textContent: 'About',
              styles: {
                color: '#fff',
                textDecoration: 'none'
              }
            }
          ]
        }
      ]
    }
  ]
};

const html = await coralToHTML(navSpec);
```

### Saving to File

```typescript
import fs from 'fs';
import { coralToHTML } from '@reallygoodwork/coral-to-html';

const spec = { /* your Coral spec */ };

const html = await coralToHTML(spec);

// Save to file
fs.writeFileSync('./output.html', html);

// Or create a complete HTML document
const document = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Component</title>
</head>
<body>
  ${html}
</body>
</html>`;

fs.writeFileSync('./document.html', document);
```

### Batch Processing

```typescript
import { coralToHTML } from '@reallygoodwork/coral-to-html';
import fs from 'fs';
import glob from 'glob';

const specFiles = glob.sync('./specs/**/*.coral.json');

for (const specFile of specFiles) {
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf-8'));
  const html = await coralToHTML(spec);

  const outputPath = specFile.replace('.coral.json', '.html');
  fs.writeFileSync(outputPath, html);

  console.log(`✓ Generated ${outputPath}`);
}
```

---

## Special Features

### Font Family Fallbacks

The package automatically adds `sans-serif` fallback for Inter font:

```typescript
// Coral
{
  fontFamily: 'Inter'
}

// HTML
style="font-family: Inter, sans-serif"
```

### Nested Styles

Nested objects (like pseudo-selectors or media queries) are filtered out, as they cannot be represented in inline styles:

```typescript
// Coral
{
  color: '#333',
  ':hover': {
    color: '#000'  // This will be ignored in HTML output
  }
}

// HTML (hover styles omitted)
style="color: #333"
```

**Note:** For responsive and pseudo-class styles, consider using the `@reallygoodwork/coral-to-react` package which can output CSS files.

---

## Output Format

The generated HTML is automatically formatted using Prettier with:
- Proper indentation
- Consistent spacing
- Readable structure
- Self-closing tag syntax

This ensures clean, production-ready HTML output.

---

## Use Cases

### Static Site Generation

```typescript
// Generate static HTML pages from Coral specs
const pages = [homeSpec, aboutSpec, contactSpec];

for (const spec of pages) {
  const html = await coralToHTML(spec);
  // Save to static files
}
```

### Email Templates

```typescript
// Convert Coral specs to email-friendly HTML
const emailSpec = {
  name: 'email',
  elementType: 'div',
  styles: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto'
  },
  children: [/* email content */]
};

const emailHTML = await coralToHTML(emailSpec);
```

### Preview Generation

```typescript
// Generate HTML previews of components
const preview = await coralToHTML(componentSpec);
// Display in iframe or preview pane
```

### Documentation

```typescript
// Generate HTML examples for documentation
const exampleHTML = await coralToHTML(exampleSpec);
// Include in docs
```

---

## Limitations

- **No CSS Classes** - Only inline styles are supported (no external CSS)
- **No Pseudo-Classes** - `:hover`, `:focus`, etc. cannot be represented inline
- **No Media Queries** - Responsive styles are filtered out
- **No Animations** - CSS animations and transitions are limited
- **Email Compatibility** - Some CSS properties may not work in email clients

For applications requiring CSS classes, media queries, or pseudo-classes, use the `@reallygoodwork/coral-to-react` package instead.

---

## Dependencies

- `@reallygoodwork/coral-core` - Core Coral types and utilities
- `prettier` - HTML formatting

---

## Related Packages

- `@reallygoodwork/coral-core` - Core utilities and types for Coral
- `@reallygoodwork/coral-to-react` - Convert Coral specs to React components
- `@reallygoodwork/react-to-coral` - Convert React components to Coral specs
- `@reallygoodwork/coral-tw2css` - Convert Tailwind classes to CSS
- `@reallygoodwork/style-to-tailwind` - Convert CSS styles to Tailwind classes

---

## License

MIT
