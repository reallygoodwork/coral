/**
 * Tests for code examples in the Getting Started guide
 * Verifies that all examples actually work and are not hallucinations
 */

import { transformReactComponentToSpec } from '@reallygoodwork/react-to-coral';
import { coralToReact } from '@reallygoodwork/coral-to-react';
import {
  transformHTMLToSpec,
  resolveNodeStyles,
  getVariantCombinations,
  generatePropsInterface,
  loadPackage,
  validatePackage,
} from '@reallygoodwork/coral-core';
import { coralToHTML } from '@reallygoodwork/coral-to-html';
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

describe('Getting Started Guide Examples', () => {
  describe('React → Coral → React', () => {
    it('should transform React component to Coral and back', async () => {
      const reactCode = `
export const Button = ({ label, onClick }) => {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onClick}>
      {label}
    </button>
  )
}
`;

      // Transform to Coral specification
      const spec = transformReactComponentToSpec(reactCode);

      // Verify spec structure
      expect(spec).toBeDefined();
      expect(spec.componentName).toBe('Button');
      expect(spec.elementType).toBe('button');

      // Generate React component from specification
      const { reactCode: generatedCode, cssCode } = await coralToReact(spec, {
        componentFormat: 'arrow',
        styleFormat: 'inline',
      });

      // Verify generated code
      expect(generatedCode).toBeDefined();
      expect(generatedCode).toContain('Button');
      expect(generatedCode).toContain('label');
    });
  });

  describe('HTML → Coral', () => {
    it('should transform HTML to Coral specification', () => {
      const html = `
<div class="container mx-auto">
  <h1 style="font-size: 24px; color: blue;">Hello World</h1>
  <p>Welcome to Coral</p>
</div>
`;

      const spec = transformHTMLToSpec(html);

      expect(spec).toBeDefined();
      expect(spec.elementType).toBe('div');
      expect(spec.children).toBeDefined();
      expect(spec.children?.length).toBeGreaterThan(0);
    });
  });

  describe('Coral → HTML', () => {
    it('should generate HTML from Coral specification', async () => {
      const spec = {
        elementType: 'div',
        styles: { padding: '20px', backgroundColor: '#f0f0f0' },
        children: [
          { elementType: 'h1', textContent: 'Hello World' },
        ],
      };

      const html = await coralToHTML(spec);

      expect(html).toBeDefined();
      expect(html).toContain('<div');
      expect(html).toContain('Hello World');
      expect(html).toContain('padding');
    });
  });

  describe('Working with Variants', () => {
    const buttonSpec = {
      name: 'Button',
      elementType: 'button',
      componentVariants: {
        axes: [
          {
            name: 'intent',
            values: ['primary', 'secondary', 'destructive'],
            default: 'primary',
          },
          {
            name: 'size',
            values: ['sm', 'md', 'lg'],
            default: 'md',
          },
        ],
      },
      styles: {
        display: 'inline-flex',
        borderRadius: '6px',
        fontWeight: '500',
      },
      variantStyles: {
        intent: {
          primary: { backgroundColor: '#007bff', color: '#fff' },
          secondary: { backgroundColor: '#6c757d', color: '#fff' },
          destructive: { backgroundColor: '#dc3545', color: '#fff' },
        },
        size: {
          sm: { padding: '4px 8px', fontSize: '12px' },
          md: { padding: '8px 16px', fontSize: '14px' },
          lg: { padding: '12px 24px', fontSize: '16px' },
        },
      },
      props: {
        label: {
          type: 'string',
          required: true,
        },
        disabled: {
          type: 'boolean',
          default: false,
        },
      },
      events: {
        onClick: {
          description: 'Button click handler',
        },
      },
    };

    it('should resolve styles for specific variant values', () => {
      const styles = resolveNodeStyles(buttonSpec, {
        intent: 'primary',
        size: 'lg',
      });

      expect(styles).toBeDefined();
      expect(styles.backgroundColor).toBe('#007bff');
      expect(styles.padding).toBe('12px 24px');
      expect(styles.fontSize).toBe('16px');
    });

    it('should get all variant combinations', () => {
      const combinations = getVariantCombinations([
        { name: 'intent', values: ['primary', 'secondary'] },
        { name: 'size', values: ['sm', 'md', 'lg'] },
      ]);

      expect(combinations).toBeDefined();
      expect(combinations.length).toBe(6);
      expect(combinations).toContainEqual({ intent: 'primary', size: 'sm' });
      expect(combinations).toContainEqual({ intent: 'primary', size: 'md' });
      expect(combinations).toContainEqual({ intent: 'primary', size: 'lg' });
      expect(combinations).toContainEqual({ intent: 'secondary', size: 'sm' });
      expect(combinations).toContainEqual({ intent: 'secondary', size: 'md' });
      expect(combinations).toContainEqual({ intent: 'secondary', size: 'lg' });
    });

    it('should generate TypeScript interface', () => {
      const tsInterface = generatePropsInterface(buttonSpec);

      expect(tsInterface).toBeDefined();
      expect(tsInterface).toContain('interface');
      expect(tsInterface).toContain('ButtonProps');
      expect(tsInterface).toContain('label');
      expect(tsInterface).toContain('disabled');
    });
  });

  describe('Loading and Validating Packages', () => {
    it('should load and validate a package', async () => {
      // Create a temporary package structure
      const tempDir = path.join(tmpdir(), `coral-test-${Date.now()}`);
      const configPath = path.join(tempDir, 'coral.config.json');
      const componentsDir = path.join(tempDir, 'components');
      const componentsIndexPath = path.join(componentsDir, 'index.json');

      await fs.mkdir(componentsDir, { recursive: true });

      // Create minimal package config
      const config = {
        name: '@test/design-system',
        version: '1.0.0',
        coral: {
          specVersion: '1.0.0',
        },
        components: {
          entry: './components/index.json',
        },
      };

      const componentsIndex = {
        name: 'Test Components',
        version: '1.0.0',
        components: [],
      };

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      await fs.writeFile(componentsIndexPath, JSON.stringify(componentsIndex, null, 2));

      // Load package
      const pkg = await loadPackage(configPath, {
        readFile: async (filePath: string) => {
          return await fs.readFile(filePath, 'utf-8');
        },
      });

      expect(pkg).toBeDefined();
      expect(pkg.config.name).toBe('@test/design-system');
      expect(pkg.components.size).toBe(0);

      // Validate package
      const result = validatePackage(pkg);
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);

      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
    });
  });

  describe('Tailwind → CSS', () => {
    it('should convert Tailwind classes to CSS style objects', () => {
      const styles = tailwindToCSS('p-4 bg-blue-500 text-white rounded-lg');

      expect(styles).toBeDefined();
      expect(styles.paddingInlineStart).toBeDefined();
      expect(styles.paddingInlineEnd).toBeDefined();
      expect(styles.paddingBlockStart).toBeDefined();
      expect(styles.paddingBlockEnd).toBeDefined();
      expect(styles.backgroundColor).toBeDefined();
      expect(styles.color).toBeDefined();
      expect(styles.borderRadius).toBeDefined();
    });
  });

  describe('Component with Variants Example', () => {
    it('should parse the complete button example from documentation', () => {
      const buttonSpec = {
        $schema: 'https://coral.design/schema.json',
        name: 'Button',
        elementType: 'button',
        $meta: {
          name: 'Button',
          version: '1.0.0',
          status: 'stable',
          category: 'Actions',
        },
        componentVariants: {
          axes: [
            {
              name: 'intent',
              values: ['primary', 'secondary', 'destructive'],
              default: 'primary',
              description: 'Visual style of the button',
            },
            {
              name: 'size',
              values: ['sm', 'md', 'lg'],
              default: 'md',
            },
          ],
        },
        props: {
          label: {
            type: 'string',
            required: true,
            description: 'Button text',
          },
          disabled: {
            type: 'boolean',
            default: false,
          },
        },
        events: {
          onClick: {
            description: 'Called when button is clicked',
            parameters: [
              { name: 'event', type: 'React.MouseEvent<HTMLButtonElement>' },
            ],
          },
        },
        styles: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer',
        },
        variantStyles: {
          intent: {
            primary: { backgroundColor: '#007bff', color: '#ffffff' },
            secondary: { backgroundColor: '#6c757d', color: '#ffffff' },
            destructive: { backgroundColor: '#dc3545', color: '#ffffff' },
          },
          size: {
            sm: { padding: '4px 8px', fontSize: '12px' },
            md: { padding: '8px 16px', fontSize: '14px' },
            lg: { padding: '12px 24px', fontSize: '16px' },
          },
        },
        stateStyles: {
          hover: {
            intent: {
              primary: { backgroundColor: '#0056b3' },
              secondary: { backgroundColor: '#5a6268' },
              destructive: { backgroundColor: '#c82333' },
            },
          },
          disabled: {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        textContent: { $prop: 'label' },
        elementAttributes: {
          type: 'button',
          disabled: { $prop: 'disabled' },
        },
        eventHandlers: {
          onClick: { $event: 'onClick' },
        },
      };

      // Verify the spec can be used with resolveNodeStyles
      const styles = resolveNodeStyles(buttonSpec, {
        intent: 'primary',
        size: 'md',
      });

      expect(styles).toBeDefined();
      expect(styles.display).toBe('inline-flex');
      expect(styles.backgroundColor).toBe('#007bff');
      expect(styles.padding).toBe('8px 16px');
    });
  });
});
