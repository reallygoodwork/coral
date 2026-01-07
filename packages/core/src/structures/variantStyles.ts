import * as z from 'zod'

import { zCoralStyleSchema } from './styles'

/**
 * Styles for a specific variant value
 * Maps variant values to their style overrides.
 *
 * @example
 * ```json
 * {
 *   "primary": { "backgroundColor": "#007bff", "color": "#ffffff" },
 *   "secondary": { "backgroundColor": "#6c757d", "color": "#ffffff" },
 *   "destructive": { "backgroundColor": "#dc3545", "color": "#ffffff" }
 * }
 * ```
 */
export const zVariantValueStylesSchema = z
  .record(
    z.string().describe('Variant value (e.g., "primary", "secondary")'),
    zCoralStyleSchema.describe('Styles to apply when this variant value is active'),
  )
  .describe('Map of variant values to their style overrides')

export type VariantValueStyles = z.infer<typeof zVariantValueStylesSchema>

/**
 * Node-level variant style responses
 * Maps axis names to their value-specific styles.
 *
 * Each node in the component tree can define how it responds
 * to the component's variant context.
 *
 * @example
 * ```json
 * {
 *   "intent": {
 *     "primary": { "backgroundColor": "#007bff" },
 *     "secondary": { "backgroundColor": "#6c757d" }
 *   },
 *   "size": {
 *     "sm": { "padding": "4px 8px", "fontSize": "12px" },
 *     "md": { "padding": "8px 16px", "fontSize": "14px" },
 *     "lg": { "padding": "12px 24px", "fontSize": "16px" }
 *   }
 * }
 * ```
 */
export const zNodeVariantStylesSchema = z
  .record(
    z.string().describe('Axis name (e.g., "intent", "size")'),
    zVariantValueStylesSchema,
  )
  .describe('Node-level variant style responses')

export type NodeVariantStyles = z.infer<typeof zNodeVariantStylesSchema>

/**
 * Compound variant styles for a node
 * Applies when multiple variant conditions match simultaneously.
 *
 * @example
 * ```json
 * {
 *   "conditions": { "intent": "destructive", "size": "sm" },
 *   "styles": { "fontWeight": "bold", "padding": "6px 12px" }
 * }
 * ```
 */
export const zCompoundVariantStyleSchema = z
  .object({
    /** Conditions that must all match */
    conditions: z
      .record(z.string(), z.string())
      .describe('Map of axis names to required values'),

    /** Styles to apply when conditions match */
    styles: zCoralStyleSchema.describe('Styles to apply when conditions match'),
  })
  .describe('Compound variant styles - apply when multiple conditions match')

export type CompoundVariantStyle = z.infer<typeof zCompoundVariantStyleSchema>

/**
 * State-specific styles (hover, focus, disabled, etc.)
 * Can be simple styles or variant-aware (different hover styles per variant).
 *
 * @example
 * Simple state styles:
 * ```json
 * {
 *   "hover": { "backgroundColor": "#0056b3" },
 *   "focus": { "outline": "2px solid #007bff", "outlineOffset": "2px" },
 *   "disabled": { "opacity": "0.5", "cursor": "not-allowed" }
 * }
 * ```
 *
 * Variant-aware state styles:
 * ```json
 * {
 *   "hover": {
 *     "intent": {
 *       "primary": { "backgroundColor": "#0056b3" },
 *       "secondary": { "backgroundColor": "#5a6268" }
 *     }
 *   }
 * }
 * ```
 */
export const zStateStylesSchema = z
  .object({
    /** Hover state styles */
    hover: z
      .union([zCoralStyleSchema, zNodeVariantStylesSchema])
      .optional()
      .describe('Styles or variant-aware styles for hover state'),

    /** Focus state styles */
    focus: z
      .union([zCoralStyleSchema, zNodeVariantStylesSchema])
      .optional()
      .describe('Styles or variant-aware styles for focus state'),

    /** Active/pressed state styles */
    active: z
      .union([zCoralStyleSchema, zNodeVariantStylesSchema])
      .optional()
      .describe('Styles or variant-aware styles for active state'),

    /** Disabled state styles */
    disabled: zCoralStyleSchema
      .optional()
      .describe('Styles for disabled state'),

    /** Focus-visible state (keyboard focus) */
    focusVisible: z
      .union([zCoralStyleSchema, zNodeVariantStylesSchema])
      .optional()
      .describe('Styles for keyboard focus state'),

    /** Focus-within state (focus on descendant) */
    focusWithin: z
      .union([zCoralStyleSchema, zNodeVariantStylesSchema])
      .optional()
      .describe('Styles when a descendant has focus'),
  })
  .passthrough() // Allow custom states
  .describe('State-specific styles (hover, focus, disabled, etc.)')

export type StateStyles = z.infer<typeof zStateStylesSchema>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if state styles are variant-aware (object with axis keys)
 * vs simple styles (object with CSS properties)
 */
export function isVariantAwareStateStyles(
  styles: unknown,
): styles is NodeVariantStyles {
  if (typeof styles !== 'object' || styles === null) {
    return false
  }

  // Check if any key looks like a CSS property (contains '-' or is camelCase CSS)
  const cssProperties = [
    'color',
    'background',
    'backgroundColor',
    'border',
    'padding',
    'margin',
    'display',
    'position',
    'width',
    'height',
    'font',
    'fontSize',
    'fontWeight',
    'opacity',
    'outline',
    'transform',
    'transition',
  ]

  const keys = Object.keys(styles)
  if (keys.length === 0) return false

  // If first key is a known CSS property, it's simple styles
  // Otherwise assume it's variant-aware (axis names)
  return !cssProperties.some((prop) =>
    keys.some((key) => key === prop || key.startsWith(prop)),
  )
}

/**
 * Merge base styles with variant-specific overrides
 *
 * @param base - Base styles
 * @param variantStyles - Variant style overrides
 * @param activeVariants - Currently active variant values
 * @returns Merged styles
 */
export function mergeVariantStyles(
  base: Record<string, unknown>,
  variantStyles: NodeVariantStyles | undefined,
  activeVariants: Record<string, string>,
): Record<string, unknown> {
  if (!variantStyles) return base

  let result = { ...base }

  // Apply variant styles in order
  for (const [axisName, axisValue] of Object.entries(activeVariants)) {
    const axisStyles = variantStyles[axisName]
    if (axisStyles) {
      const valueStyles = axisStyles[axisValue]
      if (valueStyles) {
        result = { ...result, ...valueStyles }
      }
    }
  }

  return result
}

/**
 * Apply compound variant styles if conditions match
 *
 * @param styles - Current styles
 * @param compounds - Array of compound variant styles
 * @param activeVariants - Currently active variant values
 * @returns Styles with compound overrides applied
 */
export function applyCompoundStyles(
  styles: Record<string, unknown>,
  compounds: CompoundVariantStyle[] | undefined,
  activeVariants: Record<string, string>,
): Record<string, unknown> {
  if (!compounds || compounds.length === 0) return styles

  let result = { ...styles }

  for (const compound of compounds) {
    const matches = Object.entries(compound.conditions).every(
      ([axis, value]) => activeVariants[axis] === value,
    )

    if (matches) {
      result = { ...result, ...compound.styles }
    }
  }

  return result
}
