import {
  resolveNodeStyles,
  resolveTreeStyles,
  resolveStateStyles,
  getAllNodeStyles,
  generateVariantStyleMap,
  variantsToClassName,
} from '../lib/resolveVariantStyles'
import type { CoralNode } from '../structures/coral'

describe('resolveVariantStyles', () => {
  describe('resolveNodeStyles', () => {
    it('should return base styles when no variants', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        styles: {
          backgroundColor: '#ffffff',
          padding: '8px 16px',
        },
      }

      const styles = resolveNodeStyles(node, {})
      expect(styles).toEqual({
        backgroundColor: '#ffffff',
        padding: '8px 16px',
      })
    })

    it('should merge variant styles', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        styles: {
          backgroundColor: '#ffffff',
          padding: '8px 16px',
        },
        variantStyles: {
          intent: {
            primary: { backgroundColor: '#007bff' },
            secondary: { backgroundColor: '#6c757d' },
          },
        },
      }

      const styles = resolveNodeStyles(node, { intent: 'primary' })
      expect(styles.backgroundColor).toBe('#007bff')
      expect(styles.padding).toBe('8px 16px')
    })

    it('should merge multiple variant axes', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        styles: {
          backgroundColor: '#ffffff',
        },
        variantStyles: {
          intent: {
            primary: { backgroundColor: '#007bff' },
          },
          size: {
            sm: { padding: '4px 8px' },
            md: { padding: '8px 16px' },
          },
        },
      }

      const styles = resolveNodeStyles(node, { intent: 'primary', size: 'sm' })
      expect(styles.backgroundColor).toBe('#007bff')
      expect(styles.padding).toBe('4px 8px')
    })

    it('should apply compound variant styles', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        styles: {
          fontWeight: 'normal',
        },
        variantStyles: {
          intent: {
            destructive: { backgroundColor: '#dc3545' },
          },
          size: {
            sm: { padding: '4px 8px' },
          },
        },
        compoundVariantStyles: [
          {
            conditions: { intent: 'destructive', size: 'sm' },
            styles: { fontWeight: 'bold' },
          },
        ],
      }

      const styles = resolveNodeStyles(node, { intent: 'destructive', size: 'sm' })
      expect(styles.fontWeight).toBe('bold')
      expect(styles.backgroundColor).toBe('#dc3545')
      expect(styles.padding).toBe('4px 8px')
    })

    it('should not apply compound when conditions not met', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        styles: { fontWeight: 'normal' },
        compoundVariantStyles: [
          {
            conditions: { intent: 'destructive', size: 'sm' },
            styles: { fontWeight: 'bold' },
          },
        ],
      }

      const styles = resolveNodeStyles(node, { intent: 'primary', size: 'sm' })
      expect(styles.fontWeight).toBe('normal')
    })
  })

  describe('resolveTreeStyles', () => {
    it('should resolve styles for entire tree', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        styles: { backgroundColor: '#fff' },
        variantStyles: {
          intent: { primary: { backgroundColor: '#007bff' } },
        },
        children: [
          {
            name: 'Label',
            elementType: 'span',
            styles: { color: '#000' },
            variantStyles: {
              intent: { primary: { color: '#fff' } },
            },
          },
        ],
      }

      const stylesMap = resolveTreeStyles(node, { intent: 'primary' })

      expect(stylesMap.get('Button')?.backgroundColor).toBe('#007bff')
      expect(stylesMap.get('Label')?.color).toBe('#fff')
    })
  })

  describe('resolveStateStyles', () => {
    it('should resolve simple state styles', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        stateStyles: {
          hover: { backgroundColor: '#0056b3' },
        },
      }

      const hoverStyles = resolveStateStyles(node, 'hover', {})
      expect(hoverStyles?.backgroundColor).toBe('#0056b3')
    })

    it('should return undefined for missing state', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        stateStyles: {},
      }

      const focusStyles = resolveStateStyles(node, 'focus', {})
      expect(focusStyles).toBeUndefined()
    })
  })

  describe('getAllNodeStyles', () => {
    it('should return all style states', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        styles: { backgroundColor: '#007bff' },
        stateStyles: {
          hover: { backgroundColor: '#0056b3' },
          focus: { outline: '2px solid #007bff' },
          disabled: { opacity: '0.5' },
        },
      }

      const allStyles = getAllNodeStyles(node, {})

      expect(allStyles.base.backgroundColor).toBe('#007bff')
      expect(allStyles.hover?.backgroundColor).toBe('#0056b3')
      expect(allStyles.focus?.outline).toBe('2px solid #007bff')
      expect(allStyles.disabled?.opacity).toBe('0.5')
    })
  })

  describe('generateVariantStyleMap', () => {
    it('should generate style map for all variant values', () => {
      const node: CoralNode = {
        name: 'Button',
        elementType: 'button',
        variantStyles: {
          intent: {
            primary: { backgroundColor: '#007bff' },
            secondary: { backgroundColor: '#6c757d' },
          },
          size: {
            sm: { padding: '4px 8px' },
            md: { padding: '8px 16px' },
          },
        },
      }

      const axes = [
        { name: 'intent', values: ['primary', 'secondary'] },
        { name: 'size', values: ['sm', 'md'] },
      ]

      const styleMap = generateVariantStyleMap(node, axes)

      expect(styleMap.get('intent-primary')?.backgroundColor).toBe('#007bff')
      expect(styleMap.get('intent-secondary')?.backgroundColor).toBe('#6c757d')
      expect(styleMap.get('size-sm')?.padding).toBe('4px 8px')
      expect(styleMap.get('size-md')?.padding).toBe('8px 16px')
    })
  })

  describe('variantsToClassName', () => {
    it('should generate class names from variants', () => {
      const className = variantsToClassName({ intent: 'primary', size: 'md' })
      expect(className).toBe('intent-primary size-md')
    })

    it('should support custom prefix', () => {
      const className = variantsToClassName({ intent: 'primary' }, 'btn')
      expect(className).toBe('btn-intent-primary')
    })
  })
})
