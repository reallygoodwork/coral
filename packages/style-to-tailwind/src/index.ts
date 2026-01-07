import type { CoralStyleType } from '@reallygoodwork/coral-core'
import {
  colorToArbitrary,
  colorToTailwind,
  hexToTailwindColor,
} from './colorConverter'
import { reverseMappings } from './generateReverseMappings'
import {
  buildScaleClass,
  convertToTailwindScale,
  getPropertyPrefix,
} from './scaleConverter'

export type StyleObject = {
  [key: string]: string | number | ColorObject | StyleObject
}

export type ColorObject = {
  hex?: string
  rgb?: {
    r: number
    g: number
    b: number
    a: number
  }
  hsl?: {
    h: number
    s: number
    l: number
    a: number
  }
}

/**
 * Check if a value is a Coral color object
 */
function isColorObject(value: unknown): value is ColorObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('hex' in value || ('rgb' in value && 'hsl' in value))
  )
}

/**
 * Check if a value is a nested style object (for responsive/state styles)
 */
function isNestedStyleObject(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  if (isColorObject(value)) return false

  // Check if it looks like a nested styles object
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every((k) => typeof k === 'string')
}

/**
 * Convert a CSS property-value pair to Tailwind class
 */
function convertToTailwindClass(
  property: string,
  value: string | number | ColorObject,
): string | null {
  // Handle color objects
  if (isColorObject(value)) {
    const colorClass = colorToTailwind(property, value)
    if (colorClass) return colorClass

    // Fallback to arbitrary value
    return colorToArbitrary(property, value)
  }

  // Try exact reverse mapping first
  const valueStr = String(value)
  if (reverseMappings[property]?.[valueStr]) {
    return reverseMappings[property][valueStr]
  }

  // Try numeric value with Tailwind scale
  if (typeof value === 'number') {
    const scale = convertToTailwindScale(property, value)
    if (scale) {
      const scaleClass = buildScaleClass(property, scale)
      if (scaleClass) return scaleClass
    }
  }

  // Try to parse string values with units
  if (typeof value === 'string') {
    // Check for color hex values
    if (value.startsWith('#')) {
      const colorName = hexToTailwindColor(value)
      if (colorName) {
        const prefix = getPropertyPrefix(property)
        if (prefix) {
          return `${prefix}-${colorName}`
        }
      }
      // Fallback to arbitrary
      return propertyToArbitrary(property, value)
    }

    // Parse numeric values with units (e.g., "16px", "1rem")
    const numMatch = value.match(/^(-?[\d.]+)([a-z%]+)?$/)
    if (numMatch?.[1]) {
      const num = parseFloat(numMatch[1])
      const unit = numMatch[2]

      // Convert rem/em to px for scale matching
      if (unit === 'rem' || unit === 'em') {
        const pxValue = num * 16 // 1rem = 16px
        const scale = convertToTailwindScale(property, pxValue)
        if (scale) {
          const scaleClass = buildScaleClass(property, scale)
          if (scaleClass) return scaleClass
        }
      } else if (unit === 'px' || !unit) {
        const scale = convertToTailwindScale(property, num)
        if (scale) {
          const scaleClass = buildScaleClass(property, scale)
          if (scaleClass) return scaleClass
        }
      }
    }
  }

  // Fallback to arbitrary value
  return propertyToArbitrary(property, value)
}

/**
 * Convert property-value to Tailwind arbitrary value syntax
 */
function propertyToArbitrary(
  property: string,
  value: string | number | ColorObject,
): string {
  const prefix = getPropertyPrefix(property)
  const valueStr = isColorObject(value)
    ? value.hex || '#000000'
    : typeof value === 'number'
      ? `${value}px`
      : String(value)

  if (prefix) {
    return `${prefix}-[${valueStr}]`
  }

  // For properties without known prefixes, use arbitrary property syntax
  const kebabProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
  return `[${kebabProperty}:${valueStr}]`
}

/**
 * Convert Coral styles to Tailwind CSS classes
 *
 * @param styles - Coral style object
 * @returns Array of Tailwind class names
 *
 * @example
 * ```ts
 * const classes = styleToTailwind({
 *   padding: 16,
 *   backgroundColor: { hex: '#3b82f6' },
 *   fontSize: 14
 * })
 * // Returns: ['p-4', 'bg-blue-500', 'text-sm']
 * ```
 */
export function styleToTailwind(
  styles: CoralStyleType | StyleObject,
): string[] {
  const classes: string[] = []

  for (const [property, value] of Object.entries(styles)) {
    // Skip nested objects (responsive/state styles) - handle separately
    if (isNestedStyleObject(value) && !isColorObject(value)) {
      continue
    }

    const twClass = convertToTailwindClass(
      property,
      value as string | number | ColorObject,
    )
    if (twClass) {
      classes.push(twClass)
    }
  }

  return classes
}

/**
 * Convert Coral styles to Tailwind CSS class string
 *
 * @param styles - Coral style object
 * @returns Space-separated Tailwind class string
 */
export function styleToTailwindString(
  styles: CoralStyleType | StyleObject,
): string {
  return styleToTailwind(styles).join(' ')
}

// Re-export utilities
export { colorToTailwind, hexToTailwindColor } from './colorConverter'
export { reverseMappings } from './generateReverseMappings'
export { buildScaleClass, convertToTailwindScale } from './scaleConverter'
