/**
 * Tests for code examples in package documentation (coral-to-react, coral-to-html, etc.)
 */

import { coralToReact, generatePackage } from '@reallygoodwork/coral-to-react';
import { coralToHTML } from '@reallygoodwork/coral-to-html';
import { loadPackage } from '@reallygoodwork/coral-core';
import type { CoralRootNode } from '@reallygoodwork/coral-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

describe('Package Documentation Examples', () => {
  describe('coral-to-react Basic Example', () => {
    it('should generate React component from Coral spec', async () => {
      const spec: CoralRootNode = {
        name: 'Button',
        componentName: 'Button',
        elementType: 'button',
        componentProperties: {
          label: { type: 'string' },
          onClick: { type: 'function' },
        },
        styles: {
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        },
        textContent: '{props.label}',
      };

      const { reactCode, cssCode } = await coralToReact(spec, {
        styleFormat: 'inline',
      });

      expect(reactCode).toBeDefined();
      expect(reactCode).toContain('Button');
      expect(reactCode).toContain('label');
      // When using inline styles, check for style attribute
      expect(reactCode).toContain('style={{');
      expect(reactCode).toContain('padding');
      expect(reactCode).toContain('#007bff');
      // Should not have className when using inline styles
      expect(reactCode).not.toContain('className="coral-root-button"');
    });
  });

  describe('coral-to-react Component Composition', () => {
    it('should handle component instances', async () => {
      const cardSpec: CoralRootNode = {
        name: 'Card',
        componentName: 'Card',
        elementType: 'div',
        props: {
          title: { type: 'string', required: true },
          onSave: { type: 'function' },
        },
        children: [
          {
            id: 'save-button',
            name: 'SaveButton',
            type: 'COMPONENT_INSTANCE',
            elementType: 'button',
            $component: {
              ref: './button.coral.json',
            },
            propBindings: {
              label: 'Save',
              intent: 'primary',
            },
            eventBindings: {
              onClick: { $event: 'onSave' },
            },
          } as any,
        ],
      };

      const { reactCode } = await coralToReact(cardSpec);

      expect(reactCode).toBeDefined();
      expect(reactCode).toContain('Card');
      // Component instances should generate imports
      expect(reactCode).toContain('import');
    });
  });

  describe('coral-to-react with Variants and CVA', () => {
    it('should generate CVA variant code', async () => {
      const buttonSpec: CoralRootNode = {
        name: 'Button',
        componentName: 'Button',
        elementType: 'button',
        componentVariants: {
          axes: [
            {
              name: 'intent',
              values: ['primary', 'secondary'],
              default: 'primary',
            },
            {
              name: 'size',
              values: ['sm', 'md', 'lg'],
              default: 'md',
            },
          ],
        },
        props: {
          label: { type: 'string', required: true },
          disabled: { type: 'boolean', default: false },
        },
        events: {
          onClick: { description: 'Button click handler' },
        },
        styles: {
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: '6px',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer',
        },
        variantStyles: {
          intent: {
            primary: { backgroundColor: '#007bff', color: '#ffffff' },
            secondary: { backgroundColor: '#6c757d', color: '#ffffff' },
          },
          size: {
            sm: { padding: '4px 8px', fontSize: '12px' },
            md: { padding: '8px 16px', fontSize: '14px' },
            lg: { padding: '12px 24px', fontSize: '16px' },
          },
        },
        textContent: { $prop: 'label' },
        elementAttributes: {
          disabled: { $prop: 'disabled' },
        },
        eventHandlers: {
          onClick: { $event: 'onClick' },
        },
      };

      const { reactCode } = await coralToReact(buttonSpec, {
        componentFormat: 'arrow',
        styleFormat: 'className',
        variantStrategy: 'cva',
        includeTypes: true,
      });

      expect(reactCode).toBeDefined();
      expect(reactCode).toContain('Button');
      // CVA should generate variant configuration
      expect(reactCode).toContain('variants');
    });
  });

  describe('coral-to-html Basic Example', () => {
    it('should generate HTML from Coral spec', async () => {
      const spec: CoralRootNode = {
        name: 'card',
        elementType: 'div',
        styles: {
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        children: [
          {
            name: 'title',
            elementType: 'h2',
            textContent: 'Card Title',
            styles: {
              fontSize: '24px',
              color: '#333',
            },
          },
        ],
      };

      const html = await coralToHTML(spec);

      expect(html).toBeDefined();
      expect(html).toContain('<div');
      expect(html).toContain('Card Title');
      expect(html).toContain('padding');
      expect(html).toContain('background-color');
    });
  });

  describe('coral-to-html Component Composition', () => {
    it('should handle component instances with flattening', async () => {
      // Create a minimal package structure for testing
      const tempDir = path.join(tmpdir(), `coral-html-test-${Date.now()}`);
      const componentsDir = path.join(tempDir, 'components');
      await fs.mkdir(componentsDir, { recursive: true });

      const buttonSpec: CoralRootNode = {
        name: 'Button',
        elementType: 'button',
        styles: {
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: '#ffffff',
          borderRadius: '4px',
        },
        textContent: 'Click me',
      };

      // Put button file in components directory (relative to index.json)
      const buttonPath = path.join(componentsDir, 'button.coral.json');
      await fs.writeFile(buttonPath, JSON.stringify(buttonSpec, null, 2));

      const cardSpec: CoralRootNode = {
        name: 'Card',
        elementType: 'div',
        children: [
          {
            type: 'COMPONENT_INSTANCE',
            elementType: 'button',
            $component: {
              ref: './button.coral.json',
            },
            propBindings: {
              label: 'Save',
              intent: 'primary',
            },
          } as any,
        ],
      };

      // Create a minimal package config
      const configPath = path.join(tempDir, 'coral.config.json');
      const config = {
        name: '@test/html-test',
        version: '1.0.0',
        coral: { specVersion: '1.0.0' },
        components: {
          entry: './components/index.json',
        },
      };

      await fs.writeFile(
        path.join(componentsDir, 'index.json'),
        JSON.stringify({
          name: 'Test Components',
          version: '1.0.0',
          components: [
            {
              name: 'Button',
              path: './button.coral.json',
            },
          ],
        }),
      );

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));

      // Load package
      const pkg = await loadPackage(configPath, {
        readFile: async (filePath: string) => {
          return await fs.readFile(filePath, 'utf-8');
        },
      });

      // Generate HTML with flattened composition
      const html = await coralToHTML(cardSpec, {
        package: pkg,
        flattenComposition: true,
      });

      expect(html).toBeDefined();
      expect(html).toContain('<div');
      // Component should be flattened
      expect(html).toContain('<button');

      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
    });
  });
});
