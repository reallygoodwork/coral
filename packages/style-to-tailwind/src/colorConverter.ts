/**
 * Convert Coral color objects to Tailwind color classes
 */

import type { ColorObject } from './index'

// Tailwind color palette (subset - most commonly used)
const TAILWIND_COLORS: Record<string, Record<number, string>> = {
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },
  // Add more colors as needed
}

/**
 * Convert hex color to closest Tailwind color
 *
 * @param hex - Hex color string (e.g., '#3b82f6')
 * @returns Tailwind color name and shade (e.g., 'blue-500') or null
 */
export function hexToTailwindColor(hex: string): string | null {
  const normalized = hex.toLowerCase()

  // Exact match search
  for (const [colorName, shades] of Object.entries(TAILWIND_COLORS)) {
    for (const [shade, colorHex] of Object.entries(shades)) {
      if (colorHex.toLowerCase() === normalized) {
        return `${colorName}-${shade}`
      }
    }
  }

  // Find closest color
  const closest = findClosestTailwindColor(hex)
  return closest
}

/**
 * Find the closest Tailwind color to a given hex value
 */
function findClosestTailwindColor(hex: string): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null

  let closestColor: string | null = null
  let minDistance = Infinity

  for (const [colorName, shades] of Object.entries(TAILWIND_COLORS)) {
    for (const [shade, colorHex] of Object.entries(shades)) {
      const targetRgb = hexToRgb(colorHex)
      if (!targetRgb) continue

      const distance = colorDistance(rgb, targetRgb)
      if (distance < minDistance) {
        minDistance = distance
        closestColor = `${colorName}-${shade}`
      }
    }
  }

  // Only return if reasonably close (distance < 50)
  return minDistance < 50 ? closestColor : null
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result || !result[1] || !result[2] || !result[3]) return null

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/**
 * Calculate color distance (Euclidean distance in RGB space)
 */
function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number },
): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2),
  )
}

/**
 * Convert a Coral ColorObject to Tailwind color class
 *
 * @param property - CSS property (backgroundColor, color, borderColor, etc.)
 * @param color - Coral color object
 * @returns Tailwind color class or null
 */
export function colorToTailwind(property: string, color: ColorObject): string | null {
  // Use hex value for matching
  if (!color.hex) return null

  const tailwindColor = hexToTailwindColor(color.hex)
  if (!tailwindColor) return null

  // Map property to Tailwind prefix
  const prefixMap: Record<string, string> = {
    color: 'text',
    backgroundColor: 'bg',
    borderColor: 'border',
    outlineColor: 'outline',
    ringColor: 'ring',
    fill: 'fill',
    stroke: 'stroke',
  }

  const prefix = prefixMap[property]
  if (!prefix) return null

  return `${prefix}-${tailwindColor}`
}

/**
 * Convert arbitrary color to Tailwind arbitrary value
 */
export function colorToArbitrary(property: string, color: ColorObject | string): string {
  const hexValue = typeof color === 'string' ? color : color.hex || '#000000'

  const prefixMap: Record<string, string> = {
    color: 'text',
    backgroundColor: 'bg',
    borderColor: 'border',
    outlineColor: 'outline',
    ringColor: 'ring',
    fill: 'fill',
    stroke: 'stroke',
  }

  const prefix = prefixMap[property] || property

  return `${prefix}-[${hexValue}]`
}
