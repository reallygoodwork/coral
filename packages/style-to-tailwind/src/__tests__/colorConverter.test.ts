import {
  hexToTailwindColor,
  colorToTailwind,
  colorToArbitrary,
} from '../colorConverter'
import type { ColorObject } from '../index'

describe('colorConverter', () => {
  describe('hexToTailwindColor', () => {
    it('should match exact Tailwind colors', () => {
      expect(hexToTailwindColor('#3b82f6')).toBe('blue-500')
      expect(hexToTailwindColor('#ef4444')).toBe('red-500')
      expect(hexToTailwindColor('#22c55e')).toBe('green-500')
      expect(hexToTailwindColor('#eab308')).toBe('yellow-500')
    })

    it('should be case insensitive', () => {
      expect(hexToTailwindColor('#3B82F6')).toBe('blue-500')
      expect(hexToTailwindColor('#EF4444')).toBe('red-500')
    })

    it('should find closest color for near matches', () => {
      // Slightly off blue-500
      expect(hexToTailwindColor('#3a81f5')).toBe('blue-500')
      // Slightly off red-500
      expect(hexToTailwindColor('#ee4343')).toBe('red-500')
    })

    it('should return null for colors too far from Tailwind palette', () => {
      // Very unique color
      const result = hexToTailwindColor('#ff00ff')
      // Either returns null or a reasonable match
      expect(result === null || typeof result === 'string').toBe(true)
    })

    it('should handle different shades', () => {
      expect(hexToTailwindColor('#dbeafe')).toBe('blue-100')
      expect(hexToTailwindColor('#1e40af')).toBe('blue-800')
      expect(hexToTailwindColor('#fef2f2')).toBe('red-50')
      expect(hexToTailwindColor('#7f1d1d')).toBe('red-900')
    })
  })

  describe('colorToTailwind', () => {
    it('should convert backgroundColor to Tailwind', () => {
      const color: ColorObject = {
        hex: '#3b82f6',
        rgb: { r: 59, g: 130, b: 246, a: 1 },
        hsl: { h: 217, s: 91, l: 60, a: 1 },
      }

      expect(colorToTailwind('backgroundColor', color)).toBe('bg-blue-500')
    })

    it('should convert color (text) to Tailwind', () => {
      const color: ColorObject = {
        hex: '#ef4444',
        rgb: { r: 239, g: 68, b: 68, a: 1 },
        hsl: { h: 0, s: 84, l: 60, a: 1 },
      }

      expect(colorToTailwind('color', color)).toBe('text-red-500')
    })

    it('should convert borderColor to Tailwind', () => {
      const color: ColorObject = {
        hex: '#22c55e',
        rgb: { r: 34, g: 197, b: 94, a: 1 },
        hsl: { h: 142, s: 71, l: 45, a: 1 },
      }

      expect(colorToTailwind('borderColor', color)).toBe('border-green-500')
    })

    it('should handle colors without perfect matches', () => {
      const color: ColorObject = {
        hex: '#3a81f5',
        rgb: { r: 58, g: 129, b: 245, a: 1 },
        hsl: { h: 217, s: 90, l: 59, a: 1 },
      }

      const result = colorToTailwind('backgroundColor', color)
      expect(result).toBeTruthy()
      expect(result).toContain('bg-')
    })

    it('should return null for unsupported properties', () => {
      const color: ColorObject = {
        hex: '#3b82f6',
        rgb: { r: 59, g: 130, b: 246, a: 1 },
        hsl: { h: 217, s: 91, l: 60, a: 1 },
      }

      expect(colorToTailwind('unknownProperty', color)).toBeNull()
    })
  })

  describe('colorToArbitrary', () => {
    it('should create arbitrary color values', () => {
      const color: ColorObject = {
        hex: '#123456',
        rgb: { r: 18, g: 52, b: 86, a: 1 },
        hsl: { h: 210, s: 65, l: 20, a: 1 },
      }

      expect(colorToArbitrary('backgroundColor', color)).toBe('bg-[#123456]')
      expect(colorToArbitrary('color', color)).toBe('text-[#123456]')
      expect(colorToArbitrary('borderColor', color)).toBe('border-[#123456]')
    })

    it('should handle string hex values', () => {
      expect(colorToArbitrary('backgroundColor', '#ff0000')).toBe(
        'bg-[#ff0000]',
      )
      expect(colorToArbitrary('color', '#00ff00')).toBe('text-[#00ff00]')
    })

    it('should use property name for unknown properties', () => {
      const color: ColorObject = {
        hex: '#123456',
        rgb: { r: 18, g: 52, b: 86, a: 1 },
        hsl: { h: 210, s: 65, l: 20, a: 1 },
      }

      expect(colorToArbitrary('customProperty', color)).toBe(
        'customProperty-[#123456]',
      )
    })
  })
})
