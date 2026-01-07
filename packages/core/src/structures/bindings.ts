import * as z from 'zod'

import { zPropReferenceSchema } from './references'

/**
 * Transform applied to a prop value
 * Allows converting a prop value before use.
 *
 * @example
 * ```json
 * {
 *   "$prop": "disabled",
 *   "$transform": "not"
 * }
 * ```
 */
export const zPropTransformSchema = z
  .object({
    $prop: z.string().describe('The prop name to reference'),
    $transform: z
      .enum([
        'boolean', // Convert to boolean
        'string', // Convert to string
        'number', // Convert to number
        'not', // Negate boolean
        'uppercase', // String to uppercase
        'lowercase', // String to lowercase
      ])
      .describe('Transformation to apply'),
  })
  .describe('Prop reference with transformation')

export type PropTransform = z.infer<typeof zPropTransformSchema>

/**
 * Reference to an event handler
 * Used to bind element events to component event handlers.
 *
 * @example
 * ```json
 * {
 *   "$event": "onClick",
 *   "$extract": "event.target.value"
 * }
 * ```
 */
export const zEventReferenceSchema = z
  .object({
    $event: z.string().describe('The event name to reference'),

    /** Optional: extract a value from the event before calling handler */
    $extract: z
      .string()
      .optional()
      .describe('Path to extract from event (e.g., "event.target.value")'),

    /** Optional: additional static args to pass */
    $args: z
      .array(z.unknown())
      .optional()
      .describe('Additional static arguments to pass to handler'),
  })
  .describe('Reference to an event handler')

export type EventReference = z.infer<typeof zEventReferenceSchema>

/**
 * Computed value based on props
 * Allows deriving a value from multiple props or transformations.
 *
 * @example Concatenation:
 * ```json
 * {
 *   "$computed": "concat",
 *   "$inputs": [{ "$prop": "firstName" }, " ", { "$prop": "lastName" }]
 * }
 * ```
 *
 * @example Ternary:
 * ```json
 * {
 *   "$computed": "ternary",
 *   "$inputs": [{ "$prop": "loading" }, "Loading...", { "$prop": "label" }]
 * }
 * ```
 */
export const zComputedValueSchema = z
  .object({
    $computed: z
      .enum([
        'concat', // Concatenate strings
        'template', // Template string with placeholders
        'ternary', // Conditional value: [condition, trueVal, falseVal]
        'classnames', // Merge class names (filter falsy, join with space)
      ])
      .describe('Computation type'),

    $inputs: z
      .array(z.unknown())
      .describe('Input values (can include prop references)'),
  })
  .describe('Computed value from props')

export type ComputedValue = z.infer<typeof zComputedValueSchema>

/**
 * Token reference for style values
 */
export const zTokenRefSchema = z
  .object({
    $token: z.string().describe('Token path'),
  })
  .describe('Token reference')

/**
 * Any bindable value in element attributes
 * Can be static, prop reference, event reference, computed, or token.
 */
export const zBindableValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  zPropReferenceSchema,
  zPropTransformSchema,
  zEventReferenceSchema,
  zComputedValueSchema,
  zTokenRefSchema,
])

export type BindableValue = z.infer<typeof zBindableValueSchema>

/**
 * Inline event handler definition
 * For simple handlers that don't need parent event forwarding.
 *
 * @example
 * ```json
 * {
 *   "$handler": "toggle",
 *   "$target": "isOpen"
 * }
 * ```
 */
export const zInlineHandlerSchema = z
  .object({
    $handler: z
      .enum([
        'preventDefault', // Call event.preventDefault()
        'stopPropagation', // Call event.stopPropagation()
        'toggle', // Toggle a boolean prop
        'set', // Set a value
      ])
      .describe('Handler type'),

    $target: z
      .string()
      .optional()
      .describe('Target prop for toggle/set handlers'),

    $value: z.unknown().optional().describe('Value to set'),
  })
  .describe('Inline event handler')

export type InlineHandler = z.infer<typeof zInlineHandlerSchema>

/**
 * Event binding - either forward to parent or inline handler
 */
export const zEventBindingSchema = z.union([
  zEventReferenceSchema,
  zInlineHandlerSchema,
])

export type EventBinding = z.infer<typeof zEventBindingSchema>

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a prop reference (without transform)
 */
export function isPropReference(value: unknown): value is { $prop: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$prop' in value &&
    !('$transform' in value)
  )
}

/**
 * Check if a value is a prop transform
 */
export function isPropTransform(value: unknown): value is PropTransform {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$prop' in value &&
    '$transform' in value
  )
}

/**
 * Check if a value is an event reference
 */
export function isEventReference(value: unknown): value is EventReference {
  return typeof value === 'object' && value !== null && '$event' in value
}

/**
 * Check if a value is a computed value
 */
export function isComputedValue(value: unknown): value is ComputedValue {
  return typeof value === 'object' && value !== null && '$computed' in value
}

/**
 * Check if a value is a token reference
 */
export function isTokenRef(value: unknown): value is { $token: string } {
  return typeof value === 'object' && value !== null && '$token' in value
}

/**
 * Check if a value is an inline handler
 */
export function isInlineHandler(value: unknown): value is InlineHandler {
  return typeof value === 'object' && value !== null && '$handler' in value
}

/**
 * Check if a value is any type of binding (not static)
 */
export function isBinding(value: unknown): boolean {
  return (
    isPropReference(value) ||
    isPropTransform(value) ||
    isEventReference(value) ||
    isComputedValue(value) ||
    isTokenRef(value) ||
    isInlineHandler(value)
  )
}

// ============================================================================
// Resolution Utilities
// ============================================================================

/**
 * Apply a transform to a value
 */
export function applyTransform(
  value: unknown,
  transform: PropTransform['$transform'],
): unknown {
  switch (transform) {
    case 'boolean':
      return Boolean(value)
    case 'string':
      return String(value ?? '')
    case 'number':
      return Number(value)
    case 'not':
      return !value
    case 'uppercase':
      return String(value ?? '').toUpperCase()
    case 'lowercase':
      return String(value ?? '').toLowerCase()
    default:
      return value
  }
}

/**
 * Resolve a computed value
 */
export function resolveComputed(
  computed: ComputedValue,
  resolveInput: (input: unknown) => unknown,
): unknown {
  const resolvedInputs = computed.$inputs.map(resolveInput)

  switch (computed.$computed) {
    case 'concat':
      return resolvedInputs.join('')

    case 'template': {
      // First input is template, rest are values
      const [template, ...values] = resolvedInputs
      return String(template).replace(/\{(\d+)\}/g, (_, i) =>
        String(values[Number(i)] ?? ''),
      )
    }

    case 'ternary': {
      // [condition, trueValue, falseValue]
      const [condition, trueVal, falseVal] = resolvedInputs
      return condition ? trueVal : falseVal
    }

    case 'classnames':
      return resolvedInputs.filter(Boolean).join(' ')

    default:
      return resolvedInputs[0]
  }
}

/**
 * Extract a value from an object using a dot-notation path
 */
export function extractValue(obj: unknown, path: string): unknown {
  /**
   * Type guard to check if value is a record
   */
  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (!isRecord(current)) return undefined
    current = current[part]
  }

  return current
}
