/**
 * Tests for code examples in the Component Variants guide
 */

import {
  resolveNodeStyles,
  getVariantCombinations,
  getDefaultVariantValues,
  validateVariantValues,
  variantsToClassName,
  getAllNodeStyles,
  resolveTreeStyles,
} from '@reallygoodwork/coral-core';
import type { CoralRootNode } from '@reallygoodwork/coral-core';

describe('Variants Guide Examples', () => {
  const buttonNode: CoralRootNode = {
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
  };

  describe('Variant Resolution', () => {
    it('should resolve styles for specific variant values', () => {
      const styles = resolveNodeStyles(buttonNode, {
        intent: 'primary',
        size: 'lg',
      });

      expect(styles).toBeDefined();
      expect(styles.display).toBe('inline-flex');
      expect(styles.borderRadius).toBe('6px');
      expect(styles.fontWeight).toBe('500');
      expect(styles.backgroundColor).toBe('#007bff');
      expect(styles.color).toBe('#fff');
      expect(styles.padding).toBe('12px 24px');
      expect(styles.fontSize).toBe('16px');
    });
  });

  describe('Compound Variants', () => {
    const compoundButton: CoralRootNode = {
      name: 'Button',
      elementType: 'button',
      componentVariants: {
        axes: [
          {
            name: 'intent',
            values: ['primary', 'destructive'],
            default: 'primary',
          },
          {
            name: 'size',
            values: ['sm', 'md', 'lg'],
            default: 'md',
          },
        ],
        compounds: [
          {
            conditions: { intent: 'destructive', size: 'sm' },
            description: 'Small destructive buttons need extra visual emphasis',
          },
        ],
      },
      styles: {},
      compoundVariantStyles: [
        {
          conditions: { intent: 'destructive', size: 'sm' },
          styles: {
            fontWeight: 'bold',
            border: '1px solid darkred',
          },
        },
      ],
    };

    it('should apply compound variant styles', () => {
      const styles = resolveNodeStyles(compoundButton, {
        intent: 'destructive',
        size: 'sm',
      });

      expect(styles.fontWeight).toBe('bold');
      expect(styles.border).toBe('1px solid darkred');
    });
  });

  describe('State Styles', () => {
    const buttonWithStates: CoralRootNode = {
      name: 'Button',
      elementType: 'button',
      componentVariants: {
        axes: [
          {
            name: 'intent',
            values: ['primary', 'secondary', 'destructive'],
            default: 'primary',
          },
        ],
      },
      styles: {},
      variantStyles: {
        intent: {
          primary: { backgroundColor: '#007bff' },
          secondary: { backgroundColor: '#6c757d' },
          destructive: { backgroundColor: '#dc3545' },
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
        focus: {
          intent: {
            primary: { outline: '2px solid #007bff' },
            secondary: { outline: '2px solid #6c757d' },
            destructive: { outline: '2px solid #dc3545' },
          },
        },
        disabled: {
          opacity: '0.5',
          cursor: 'not-allowed',
        },
      },
    };

    it('should get all node styles including state styles', () => {
      const allStyles = getAllNodeStyles(buttonWithStates, {
        intent: 'primary',
      });

      expect(allStyles).toBeDefined();
      expect(allStyles.base).toBeDefined();
      expect(allStyles.hover).toBeDefined();
      expect(allStyles.focus).toBeDefined();
      expect(allStyles.disabled).toBeDefined();
      expect(allStyles.hover?.backgroundColor).toBe('#0056b3');
    });
  });

  describe('Utility Functions', () => {
    it('should get all variant combinations', () => {
      const axes = [
        { name: 'intent', values: ['primary', 'secondary'] },
        { name: 'size', values: ['sm', 'md', 'lg'] },
      ];

      const combinations = getVariantCombinations(axes);

      expect(combinations.length).toBe(6);
      expect(combinations).toContainEqual({
        intent: 'primary',
        size: 'sm',
      });
      expect(combinations).toContainEqual({
        intent: 'primary',
        size: 'md',
      });
      expect(combinations).toContainEqual({
        intent: 'primary',
        size: 'lg',
      });
      expect(combinations).toContainEqual({
        intent: 'secondary',
        size: 'sm',
      });
      expect(combinations).toContainEqual({
        intent: 'secondary',
        size: 'md',
      });
      expect(combinations).toContainEqual({
        intent: 'secondary',
        size: 'lg',
      });
    });

    it('should get default variant values', () => {
      const axes = [
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
      ];

      const defaults = getDefaultVariantValues(axes);

      expect(defaults).toEqual({
        intent: 'primary',
        size: 'md',
      });
    });

    it('should validate variant values', () => {
      const axes = [
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
      ];

      const errors = validateVariantValues(
        { intent: 'invalid', size: 'md' },
        axes,
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('invalid');
      expect(errors[0]).toContain('intent');
    });

    it('should generate CSS class names from variants', () => {
      const className = variantsToClassName(
        { intent: 'primary', size: 'lg' },
        'btn',
      );

      expect(className).toBeDefined();
      expect(className).toContain('btn');
      expect(className).toContain('primary');
      expect(className).toContain('lg');
    });
  });

  describe('Per-Node Variant Responses', () => {
    const cardWithNodeVariants: CoralRootNode = {
      name: 'Card',
      elementType: 'div',
      componentVariants: {
        axes: [
          {
            name: 'variant',
            values: ['elevated', 'outlined', 'filled'],
            default: 'elevated',
          },
        ],
      },
      variantStyles: {
        variant: {
          elevated: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
          outlined: { border: '1px solid #e0e0e0' },
          filled: { backgroundColor: '#f5f5f5' },
        },
      },
      children: [
        {
          name: 'Header',
          elementType: 'div',
          styles: { padding: '16px' },
          variantStyles: {
            variant: {
              elevated: { borderBottom: 'none' },
              outlined: { borderBottom: '1px solid #e0e0e0' },
              filled: { borderBottom: '1px solid #e8e8e8' },
            },
          },
        },
        {
          name: 'Content',
          elementType: 'div',
          styles: { padding: '16px' },
        },
      ],
    };

    it('should resolve styles for entire tree', () => {
      const styleMap = resolveTreeStyles(cardWithNodeVariants, {
        variant: 'outlined',
      });

      expect(styleMap).toBeDefined();
      expect(styleMap.size).toBeGreaterThan(0);
    });
  });
});
