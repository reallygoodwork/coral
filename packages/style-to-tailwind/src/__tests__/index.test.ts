import { styleToTailwind, styleToTailwindString } from '../index'
import type { ColorObject } from '../index'

describe('styleToTailwind', () => {
  describe('basic conversions', () => {
    it('should convert simple padding', () => {
      const result = styleToTailwind({ padding: 16 })
      expect(result).toContain('p-4')
    })

    it('should convert simple margin', () => {
      const result = styleToTailwind({ margin: 8 })
      expect(result).toContain('m-2')
    })

    it('should convert font size', () => {
      const result = styleToTailwind({ fontSize: 14 })
      expect(result).toContain('text-sm')
    })

    it('should convert multiple properties', () => {
      const result = styleToTailwind({
        padding: 16,
        margin: 8,
        fontSize: 14,
      })

      expect(result).toContain('p-4')
      expect(result).toContain('m-2')
      expect(result).toContain('text-sm')
      expect(result).toHaveLength(3)
    })
  })

  describe('color conversions', () => {
    it('should convert backgroundColor with color object', () => {
      const color: ColorObject = {
        hex: '#3b82f6',
        rgb: { r: 59, g: 130, b: 246, a: 1 },
        hsl: { h: 217, s: 91, l: 60, a: 1 },
      }

      const result = styleToTailwind({ backgroundColor: color })
      expect(result).toContain('bg-blue-500')
    })

    it('should convert text color', () => {
      const color: ColorObject = {
        hex: '#ef4444',
        rgb: { r: 239, g: 68, b: 68, a: 1 },
        hsl: { h: 0, s: 84, l: 60, a: 1 },
      }

      const result = styleToTailwind({ color })
      expect(result).toContain('text-red-500')
    })

    it('should handle hex string colors', () => {
      const result = styleToTailwind({ backgroundColor: '#3b82f6' })
      expect(result.some((c) => c.startsWith('bg-'))).toBe(true)
    })
  })

  describe('complex styles', () => {
    it('should convert button-like styles', () => {
      const result = styleToTailwind({
        padding: 16,
        backgroundColor: { hex: '#3b82f6' } as ColorObject,
        color: { hex: '#ffffff' } as ColorObject,
        borderRadius: 8,
        fontSize: 14,
      })

      expect(result).toContain('p-4')
      expect(result.some((c) => c.startsWith('bg-'))).toBe(true)
      expect(result.some((c) => c.startsWith('text-'))).toBe(true)
      expect(result).toContain('rounded-lg')
      expect(result).toContain('text-sm')
    })

    it('should handle sizing properties', () => {
      const result = styleToTailwind({
        width: 64,
        height: 32,
        minWidth: 16,
        maxWidth: 96,
      })

      expect(result).toContain('w-16')
      expect(result).toContain('h-8')
      expect(result).toContain('min-w-4')
      expect(result).toContain('max-w-24')
    })

    it('should handle gap properties', () => {
      const result = styleToTailwind({
        gap: 16,
      })

      expect(result).toContain('gap-4')
    })
  })

  describe('arbitrary values', () => {
    it('should use arbitrary values for non-standard sizes', () => {
      const result = styleToTailwind({ padding: 13 })
      // Should fall back to arbitrary or closest match
      expect(result.length).toBeGreaterThan(0)
    })

    it('should use arbitrary values for custom colors', () => {
      const customColor: ColorObject = {
        hex: '#123456',
        rgb: { r: 18, g: 52, b: 86, a: 1 },
        hsl: { h: 210, s: 65, l: 20, a: 1 },
      }

      const result = styleToTailwind({ backgroundColor: customColor })
      // Should either match a Tailwind color or use arbitrary
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toContain('bg-')
    })
  })

  describe('string values with units', () => {
    it('should handle px units', () => {
      const result = styleToTailwind({ padding: '16px' })
      expect(result).toContain('p-4')
    })

    it('should handle rem units', () => {
      const result = styleToTailwind({ padding: '1rem' })
      // 1rem = 16px = scale 4
      expect(result).toContain('p-4')
    })

    it('should handle string numbers', () => {
      const result = styleToTailwind({ padding: '16' })
      expect(result).toContain('p-4')
    })
  })

  describe('nested objects', () => {
    it('should skip nested style objects (responsive/state)', () => {
      const result = styleToTailwind({
        padding: 16,
        sm: {
          padding: 24,
        },
      })

      // Should only convert top-level padding
      expect(result).toContain('p-4')
      expect(result).toHaveLength(1)
    })

    it('should not skip color objects (they have nested structure)', () => {
      const color: ColorObject = {
        hex: '#3b82f6',
        rgb: { r: 59, g: 130, b: 246, a: 1 },
        hsl: { h: 217, s: 91, l: 60, a: 1 },
      }

      const result = styleToTailwind({ backgroundColor: color })
      expect(result).toContain('bg-blue-500')
    })
  })

  describe('styleToTailwindString', () => {
    it('should return space-separated class string', () => {
      const result = styleToTailwindString({
        padding: 16,
        margin: 8,
        fontSize: 14,
      })

      expect(typeof result).toBe('string')
      expect(result.split(' ')).toHaveLength(3)
      expect(result).toContain('p-4')
      expect(result).toContain('m-2')
      expect(result).toContain('text-sm')
    })

    it('should handle empty styles', () => {
      const result = styleToTailwindString({})
      expect(result).toBe('')
    })

    it('should handle single style', () => {
      const result = styleToTailwindString({ padding: 16 })
      expect(result).toBe('p-4')
    })
  })

  describe('edge cases', () => {
    it('should handle zero values', () => {
      const result = styleToTailwind({
        padding: 0,
        margin: 0,
      })

      expect(result).toContain('p-0')
      expect(result).toContain('m-0')
    })

    it('should handle empty object', () => {
      const result = styleToTailwind({})
      expect(result).toEqual([])
    })

    it('should handle undefined values gracefully', () => {
      const result = styleToTailwind({
        padding: 16,
        margin: undefined as any,
      })

      expect(result).toContain('p-4')
      // Should not throw, may or may not include margin
    })
  })

  describe('real-world component styles', () => {
    it('should convert button styles', () => {
      const buttonStyles = {
        padding: 12,
        fontSize: 14,
        fontWeight: 600,
        backgroundColor: { hex: '#3b82f6' } as ColorObject,
        color: { hex: '#ffffff' } as ColorObject,
        borderRadius: 6,
      }

      const result = styleToTailwind(buttonStyles)

      expect(result).toContain('p-3')
      expect(result).toContain('text-sm')
      expect(result.some((c) => c.includes('bg-'))).toBe(true)
      expect(result.some((c) => c.includes('text-'))).toBe(true)
      expect(result).toContain('rounded-md')
    })

    it('should convert card styles', () => {
      const cardStyles = {
        padding: 24,
        backgroundColor: { hex: '#ffffff' } as ColorObject,
        borderRadius: 12,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }

      const result = styleToTailwind(cardStyles)

      expect(result).toContain('p-6')
      expect(result.some((c) => c.includes('bg-'))).toBe(true)
      expect(result).toContain('rounded-xl')
      // boxShadow might use arbitrary value
      expect(result.length).toBeGreaterThan(0)
    })

    it('should convert layout styles', () => {
      const layoutStyles = {
        display: 'flex',
        gap: 16,
        padding: 32,
      }

      const result = styleToTailwind(layoutStyles)

      // display might not convert (needs exact mapping)
      expect(result).toContain('gap-4')
      expect(result).toContain('p-8')
    })
  })
})
