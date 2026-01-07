import { generateCVA, generateCNHelper } from '../generateCVA'
import type { CoralRootNode } from '@reallygoodwork/coral-core'

describe('generateCVA', () => {
  describe('basic variant generation', () => {
    it('should generate CVA config for simple button variants', () => {
      const buttonSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Button',
        componentName: 'Button',
        tag: 'button',
        styles: {
          padding: 16,
          borderRadius: 8,
          fontSize: 14,
        },
        componentVariants: {
          axes: [
            {
              name: 'intent',
              values: ['primary', 'secondary'],
              default: 'primary',
            },
          ],
          compounds: [],
        },
        variantStyles: {
          intent: {
            primary: {
              backgroundColor: { hex: '#3b82f6' },
              color: { hex: '#ffffff' },
            },
            secondary: {
              backgroundColor: { hex: '#6b7280' },
              color: { hex: '#ffffff' },
            },
          },
        },
      }

      const result = generateCVA(buttonSpec)

      expect(result.config.base).toContain('p-4')
      expect(result.config.base).toContain('rounded-lg')
      expect(result.config.variants).toBeDefined()
      expect(result.config.variants?.intent).toBeDefined()
      expect(result.config.variants?.intent.primary).toContain('bg-')
      expect(result.config.variants?.intent.secondary).toContain('bg-')
      expect(result.config.defaultVariants).toEqual({ intent: 'primary' })
    })

    it('should generate CVA config for multiple variant axes', () => {
      const buttonSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Button',
        componentName: 'Button',
        tag: 'button',
        styles: {
          padding: 16,
        },
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
          compounds: [],
        },
        variantStyles: {
          intent: {
            primary: { backgroundColor: { hex: '#3b82f6' } },
            secondary: { backgroundColor: { hex: '#6b7280' } },
          },
          size: {
            sm: { padding: 8, fontSize: 12 },
            md: { padding: 16, fontSize: 14 },
            lg: { padding: 24, fontSize: 16 },
          },
        },
      }

      const result = generateCVA(buttonSpec)

      expect(result.config.variants?.intent).toBeDefined()
      expect(result.config.variants?.size).toBeDefined()
      expect(result.config.variants?.size.sm).toContain('p-2')
      expect(result.config.variants?.size.md).toContain('p-4')
      expect(result.config.variants?.size.lg).toContain('p-6')
      expect(result.config.defaultVariants).toEqual({
        intent: 'primary',
        size: 'md',
      })
    })
  })

  describe('compound variants', () => {
    it('should generate compound variant config', () => {
      const buttonSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Button',
        componentName: 'Button',
        tag: 'button',
        styles: {},
        componentVariants: {
          axes: [
            {
              name: 'intent',
              values: ['destructive'],
              default: 'destructive',
            },
            {
              name: 'size',
              values: ['sm'],
              default: 'sm',
            },
          ],
          compounds: [
            {
              conditions: { intent: 'destructive', size: 'sm' },
              description: 'Small destructive needs extra emphasis',
            },
          ],
        },
        variantStyles: {
          intent: {
            destructive: { backgroundColor: { hex: '#ef4444' } },
          },
          size: {
            sm: { padding: 8 },
          },
        },
        compoundVariantStyles: [
          {
            conditions: { intent: 'destructive', size: 'sm' },
            styles: { fontWeight: 600 },
          },
        ],
      }

      const result = generateCVA(buttonSpec)

      expect(result.config.compoundVariants).toBeDefined()
      expect(result.config.compoundVariants?.length).toBe(1)
      expect(result.config.compoundVariants?.[0]).toEqual({
        intent: 'destructive',
        size: 'sm',
        class: expect.any(String),
      })
    })
  })

  describe('no variants', () => {
    it('should handle components without variants', () => {
      const simpleSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Card',
        componentName: 'Card',
        tag: 'div',
        styles: {
          padding: 24,
          borderRadius: 12,
        },
      }

      const result = generateCVA(simpleSpec)

      expect(result.config.base).toContain('p-6')
      expect(result.config.base).toContain('rounded-xl')
      expect(result.config.variants).toBeUndefined()
      expect(result.code).toContain("const componentVariants = cva('")
    })

    it('should handle empty styles', () => {
      const emptySpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Empty',
        componentName: 'Empty',
        tag: 'div',
      }

      const result = generateCVA(emptySpec)

      expect(result.config.base).toBeFalsy()
      expect(result.code).toContain("const componentVariants = cva('')")
    })
  })

  describe('imports and code generation', () => {
    it('should include necessary imports', () => {
      const buttonSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Button',
        componentName: 'Button',
        tag: 'button',
        styles: { padding: 16 },
        componentVariants: {
          axes: [
            {
              name: 'intent',
              values: ['primary'],
              default: 'primary',
            },
          ],
          compounds: [],
        },
        variantStyles: {
          intent: {
            primary: { backgroundColor: { hex: '#3b82f6' } },
          },
        },
      }

      const result = generateCVA(buttonSpec)

      expect(result.imports).toContain(
        "import { cva } from 'class-variance-authority'",
      )
      expect(result.imports).toContain("import { cn } from '@/lib/utils'")
    })

    it('should generate valid CVA function call code', () => {
      const buttonSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Button',
        componentName: 'Button',
        tag: 'button',
        styles: { padding: 16 },
        componentVariants: {
          axes: [
            {
              name: 'intent',
              values: ['primary', 'secondary'],
              default: 'primary',
            },
          ],
          compounds: [],
        },
        variantStyles: {
          intent: {
            primary: { backgroundColor: { hex: '#3b82f6' } },
            secondary: { backgroundColor: { hex: '#6b7280' } },
          },
        },
      }

      const result = generateCVA(buttonSpec)

      expect(result.code).toContain('const componentVariants = cva(')
      expect(result.code).toContain('variants: {')
      expect(result.code).toContain('intent: {')
      expect(result.code).toContain('primary:')
      expect(result.code).toContain('secondary:')
      expect(result.code).toContain('defaultVariants: {')
      expect(result.code).toContain("intent: 'primary'")
    })
  })

  describe('state styles', () => {
    it('should generate state configs when includeStates is true', () => {
      const buttonSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Button',
        componentName: 'Button',
        tag: 'button',
        styles: { padding: 16 },
        stateStyles: {
          hover: {
            backgroundColor: { hex: '#2563eb' },
          },
          disabled: {
            opacity: 0.5,
          },
        },
      }

      const result = generateCVA(buttonSpec, { includeStates: true })

      expect(result.stateConfigs).toBeDefined()
      expect(result.stateConfigs?.hover).toBeDefined()
      expect(result.stateConfigs?.disabled).toBeDefined()
      expect(result.stateConfigs?.hover?.base).toContain('bg-')
    })

    it('should handle variant-aware state styles', () => {
      const buttonSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Button',
        componentName: 'Button',
        tag: 'button',
        styles: { padding: 16 },
        componentVariants: {
          axes: [
            {
              name: 'intent',
              values: ['primary', 'secondary'],
              default: 'primary',
            },
          ],
          compounds: [],
        },
        variantStyles: {
          intent: {
            primary: { backgroundColor: { hex: '#3b82f6' } },
            secondary: { backgroundColor: { hex: '#6b7280' } },
          },
        },
        stateStyles: {
          hover: {
            intent: {
              primary: { backgroundColor: { hex: '#2563eb' } },
              secondary: { backgroundColor: { hex: '#4b5563' } },
            },
          },
        },
      }

      const result = generateCVA(buttonSpec, { includeStates: true })

      expect(result.stateConfigs?.hover).toBeDefined()
      expect(result.stateConfigs?.hover?.variants).toBeDefined()
      expect(result.stateConfigs?.hover?.variants?.intent).toBeDefined()
    })
  })

  describe('generateCNHelper', () => {
    it('should generate cn helper utility', () => {
      const helper = generateCNHelper()

      expect(helper).toContain('import { clsx')
      expect(helper).toContain('import { twMerge')
      expect(helper).toContain('export function cn(')
      expect(helper).toContain('twMerge(clsx(inputs))')
    })
  })

  describe('edge cases', () => {
    it('should handle missing variant styles gracefully', () => {
      const buttonSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Button',
        componentName: 'Button',
        tag: 'button',
        styles: { padding: 16 },
        componentVariants: {
          axes: [
            {
              name: 'intent',
              values: ['primary', 'secondary'],
              default: 'primary',
            },
          ],
          compounds: [],
        },
        // variantStyles is missing
      }

      const result = generateCVA(buttonSpec)

      expect(result.config.base).toBeDefined()
      expect(result.config.defaultVariants).toEqual({ intent: 'primary' })
      // Should still generate config but variants will be empty
    })

    it('should handle partial variant value styles', () => {
      const buttonSpec: CoralRootNode = {
        type: 'ROOT',
        name: 'Button',
        componentName: 'Button',
        tag: 'button',
        styles: {},
        componentVariants: {
          axes: [
            {
              name: 'intent',
              values: ['primary', 'secondary', 'tertiary'],
              default: 'primary',
            },
          ],
          compounds: [],
        },
        variantStyles: {
          intent: {
            primary: { backgroundColor: { hex: '#3b82f6' } },
            // secondary missing
            tertiary: { backgroundColor: { hex: '#10b981' } },
          },
        },
      }

      const result = generateCVA(buttonSpec)

      expect(result.config.variants?.intent.primary).toBeDefined()
      expect(result.config.variants?.intent.secondary).toBeUndefined()
      expect(result.config.variants?.intent.tertiary).toBeDefined()
    })
  })
})
