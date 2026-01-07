import * as z from 'zod'

import { zCoralNameSchema } from './utilities'

/**
 * A single variant axis (e.g., "intent", "size")
 * Represents a dimension of variation for a component.
 *
 * @example
 * ```json
 * {
 *   "name": "intent",
 *   "values": ["primary", "secondary", "destructive", "ghost"],
 *   "default": "primary",
 *   "description": "Visual style indicating button purpose"
 * }
 * ```
 */
export const zVariantAxisSchema = z
  .object({
    /** Axis name - becomes a prop on the component */
    name: zCoralNameSchema.describe('Axis name - must be a valid identifier'),

    /** Possible values for this axis */
    values: z
      .array(z.string())
      .min(1)
      .describe('Possible values for this axis'),

    /** Default value when not specified */
    default: z.string().describe('Default value when not specified'),

    /** Human-readable description */
    description: z.string().optional().describe('Human-readable description'),
  })
  .describe('A single variant axis (e.g., "intent", "size")')

export type VariantAxis = z.infer<typeof zVariantAxisSchema>

/**
 * Compound variant condition - applies when multiple axes match
 * Used for edge cases where specific combinations need special handling.
 *
 * @example
 * ```json
 * {
 *   "conditions": { "intent": "destructive", "size": "sm" },
 *   "description": "Small destructive buttons need extra visual weight"
 * }
 * ```
 */
export const zCompoundVariantConditionSchema = z
  .object({
    /** Conditions that must all be true */
    conditions: z
      .record(z.string(), z.string())
      .describe('Map of axis names to required values'),

    /** Description of when/why this compound applies */
    description: z.string().optional().describe('Description of this compound condition'),
  })
  .describe('Compound variant condition - applies when multiple axes match')

export type CompoundVariantCondition = z.infer<typeof zCompoundVariantConditionSchema>

/**
 * Component-level variant definition
 * Defines all variant axes and compound conditions for a component.
 *
 * Variants are defined at the component level, not per-node.
 * All nodes in a component respond to the same variant context simultaneously.
 * This matches how designers think about component states—a "destructive button"
 * is a holistic mode, not a mix of states.
 *
 * @example
 * ```json
 * {
 *   "axes": [
 *     {
 *       "name": "intent",
 *       "values": ["primary", "secondary", "destructive"],
 *       "default": "primary"
 *     },
 *     {
 *       "name": "size",
 *       "values": ["sm", "md", "lg"],
 *       "default": "md"
 *     }
 *   ],
 *   "compounds": [
 *     {
 *       "conditions": { "intent": "destructive", "size": "sm" },
 *       "description": "Small destructive needs special padding"
 *     }
 *   ]
 * }
 * ```
 */
export const zComponentVariantsSchema = z
  .object({
    /** All variant axes for this component */
    axes: z
      .array(zVariantAxisSchema)
      .default([])
      .describe('All variant axes for this component'),

    /** Compound variant definitions (for edge cases) */
    compounds: z
      .array(zCompoundVariantConditionSchema)
      .default([])
      .describe('Compound variant definitions'),
  })
  .describe('Component-level variant configuration')

export type ComponentVariants = z.infer<typeof zComponentVariantsSchema>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all possible variant combinations for a component.
 * Useful for generating documentation, testing, or style compilation.
 *
 * @param axes - The variant axes to combine
 * @returns Array of all possible variant value combinations
 *
 * @example
 * ```ts
 * const axes = [
 *   { name: 'intent', values: ['primary', 'secondary'], default: 'primary' },
 *   { name: 'size', values: ['sm', 'md'], default: 'md' }
 * ]
 *
 * getVariantCombinations(axes)
 * // Returns:
 * // [
 * //   { intent: 'primary', size: 'sm' },
 * //   { intent: 'primary', size: 'md' },
 * //   { intent: 'secondary', size: 'sm' },
 * //   { intent: 'secondary', size: 'md' }
 * // ]
 * ```
 */
export function getVariantCombinations(
  axes: Array<{ name: string; values: string[] }>,
): Record<string, string>[] {
  if (axes.length === 0) return [{}]

  const first = axes[0]
  const rest = axes.slice(1)

  if (!first) return [{}]

  const restCombinations = getVariantCombinations(rest)

  const result: Record<string, string>[] = []
  for (const value of first.values) {
    for (const restCombo of restCombinations) {
      result.push({ [first.name]: value, ...restCombo })
    }
  }

  return result
}

/**
 * Get the default variant values for a component
 *
 * @param axes - The variant axes
 * @returns Record of axis names to their default values
 */
export function getDefaultVariantValues(
  axes: Array<{ name: string; default: string }>,
): Record<string, string> {
  const defaults: Record<string, string> = {}
  for (const axis of axes) {
    defaults[axis.name] = axis.default
  }
  return defaults
}

/**
 * Validate that variant values are valid for given axes
 *
 * @param values - The variant values to validate
 * @param axes - The variant axes to validate against
 * @returns Array of validation errors (empty if valid)
 */
export function validateVariantValues(
  values: Record<string, string>,
  axes: VariantAxis[],
): string[] {
  const errors: string[] = []
  const axisMap = new Map(axes.map((a) => [a.name, a]))

  for (const [name, value] of Object.entries(values)) {
    const axis = axisMap.get(name)
    if (!axis) {
      errors.push(`Unknown variant axis: "${name}"`)
      continue
    }
    if (!axis.values.includes(value)) {
      errors.push(
        `Invalid value "${value}" for axis "${name}". Expected one of: ${axis.values.join(', ')}`,
      )
    }
  }

  return errors
}

/**
 * Check if a compound variant condition matches the given values
 *
 * @param compound - The compound condition to check
 * @param values - The current variant values
 * @returns Whether the compound matches
 */
export function matchesCompoundCondition(
  compound: CompoundVariantCondition,
  values: Record<string, string>,
): boolean {
  return Object.entries(compound.conditions).every(
    ([axis, requiredValue]) => values[axis] === requiredValue,
  )
}
