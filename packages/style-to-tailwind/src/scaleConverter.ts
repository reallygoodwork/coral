/**
 * Convert numeric CSS values to Tailwind scale units
 */

// Tailwind spacing scale
// Maps scale number to px value
// e.g., scale 4 = 16px (1rem), scale 8 = 32px (2rem)
const SPACING_SCALE: Record<string, number> = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
  '36': 144,
  '40': 160,
  '44': 176,
  '48': 192,
  '52': 208,
  '56': 224,
  '60': 240,
  '64': 256,
  '72': 288,
  '80': 320,
  '96': 384,
}

// Create reverse mapping (px → scale)
const PX_TO_SCALE: Record<number, string> = {}
for (const [scale, px] of Object.entries(SPACING_SCALE)) {
  PX_TO_SCALE[px] = scale
}

/**
 * Properties that use Tailwind spacing scale
 */
const SPACING_PROPERTIES = [
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingInlineStart',
  'paddingInlineEnd',
  'paddingBlockStart',
  'paddingBlockEnd',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginInlineStart',
  'marginInlineEnd',
  'marginBlockStart',
  'marginBlockEnd',
  'gap',
  'rowGap',
  'columnGap',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
]

/**
 * Properties that use Tailwind font size scale
 */
const FONT_SIZE_SCALE: Record<number, string> = {
  12: 'xs',
  14: 'sm',
  16: 'base',
  18: 'lg',
  20: 'xl',
  24: '2xl',
  30: '3xl',
  36: '4xl',
  48: '5xl',
  60: '6xl',
  72: '7xl',
  96: '8xl',
  128: '9xl',
}

/**
 * Convert a numeric value to Tailwind scale
 *
 * @param property - CSS property name
 * @param value - Numeric value (in px)
 * @returns Tailwind scale value or null if no match
 */
export function convertToTailwindScale(
  property: string,
  value: number | string,
): string | null {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  // Font size
  if (property === 'fontSize') {
    return FONT_SIZE_SCALE[numValue] || null
  }

  // Spacing properties
  if (SPACING_PROPERTIES.includes(property)) {
    // Check if we have an exact match (px → scale)
    if (PX_TO_SCALE[numValue]) {
      return PX_TO_SCALE[numValue]
    }

    // Try to find closest match
    const closest = findClosestScale(numValue)
    if (closest !== null && Math.abs(numValue - closest) <= 2) {
      return PX_TO_SCALE[closest] || null
    }
  }

  return null
}

/**
 * Find the closest px value in Tailwind spacing scale
 */
function findClosestScale(px: number): number | null {
  const pxValues = Object.keys(PX_TO_SCALE).map(Number)
  if (pxValues.length === 0) return null

  let closest: number | undefined = pxValues[0]
  if (closest === undefined) return null

  let minDiff = Math.abs(px - closest)

  for (const pxValue of pxValues) {
    const diff = Math.abs(px - pxValue)
    if (diff < minDiff) {
      closest = pxValue
      minDiff = diff
    }
  }

  return closest ?? null
}

/**
 * Get Tailwind prefix for a property
 */
export function getPropertyPrefix(property: string): string | null {
  const prefixMap: Record<string, string> = {
    padding: 'p',
    paddingTop: 'pt',
    paddingRight: 'pr',
    paddingBottom: 'pb',
    paddingLeft: 'pl',
    paddingInlineStart: 'ps',
    paddingInlineEnd: 'pe',
    paddingBlockStart: 'pt',
    paddingBlockEnd: 'pb',
    margin: 'm',
    marginTop: 'mt',
    marginRight: 'mr',
    marginBottom: 'mb',
    marginLeft: 'ml',
    marginInlineStart: 'ms',
    marginInlineEnd: 'me',
    marginBlockStart: 'mt',
    marginBlockEnd: 'mb',
    gap: 'gap',
    width: 'w',
    height: 'h',
    minWidth: 'min-w',
    minHeight: 'min-h',
    maxWidth: 'max-w',
    maxHeight: 'max-h',
    fontSize: 'text',
    fontWeight: 'font',
    backgroundColor: 'bg',
    color: 'text',
    borderRadius: 'rounded',
    borderWidth: 'border',
  }

  return prefixMap[property] || null
}

/**
 * Build a Tailwind class from property and scale
 */
export function buildScaleClass(
  property: string,
  scale: string,
): string | null {
  const prefix = getPropertyPrefix(property)
  if (!prefix) return null

  // Special cases
  if (property === 'borderRadius') {
    const roundedMap: Record<string, string> = {
      '0': 'none',
      '2': 'sm',
      '4': '',
      '6': 'md',
      '8': 'lg',
      '12': 'xl',
      '16': '2xl',
      '24': '3xl',
      '9999': 'full',
    }
    const suffix = roundedMap[scale]
    return suffix === '' ? 'rounded' : `rounded-${suffix}`
  }

  return `${prefix}-${scale}`
}
