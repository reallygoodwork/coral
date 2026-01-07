import * as z from 'zod'

/**
 * Primitive prop types
 */
export const zPrimitivePropTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
])

export type PrimitivePropType = z.infer<typeof zPrimitivePropTypeSchema>

/**
 * Complex prop type definitions
 * Supports primitives, enums, arrays, objects, unions, ReactNode, and functions.
 */
export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'ReactNode'
  | 'function'
  | 'any'
  | { enum: string[] }
  | { array: PropType }
  | { object: Record<string, PropType> }
  | { union: PropType[] }

/**
 * Schema for complex prop types (recursive)
 */
export const zPropTypeSchema: z.ZodType<PropType> = z.lazy(() =>
  z.union([
    // Primitives
    zPrimitivePropTypeSchema,

    // React node (for slot-like props)
    z.literal('ReactNode'),

    // Function/callback
    z.literal('function'),

    // Any (escape hatch)
    z.literal('any'),

    // Enum/union of strings
    z.object({
      enum: z.array(z.string()).describe('Allowed string values'),
    }),

    // Array of type
    z.object({
      array: zPropTypeSchema.describe('Element type'),
    }),

    // Object with shape
    z.object({
      object: z.record(z.string(), zPropTypeSchema).describe('Object shape'),
    }),

    // Union of multiple types
    z.object({
      union: z.array(zPropTypeSchema).describe('Union member types'),
    }),
  ]),
)

/**
 * Prop constraints for validation
 */
export const zPropConstraintsSchema = z
  .object({
    /** Minimum value (for numbers) */
    min: z.number().optional(),

    /** Maximum value (for numbers) */
    max: z.number().optional(),

    /** Step value (for numbers) */
    step: z.number().optional(),

    /** Minimum length (for strings/arrays) */
    minLength: z.number().optional(),

    /** Maximum length (for strings/arrays) */
    maxLength: z.number().optional(),

    /** Regex pattern (for strings) */
    pattern: z.string().optional(),
  })
  .describe('Constraints for prop validation')

export type PropConstraints = z.infer<typeof zPropConstraintsSchema>

/**
 * Editor control hints for design tools
 */
export const zEditorControlSchema = z.enum([
  'text',
  'textarea',
  'number',
  'boolean',
  'select',
  'multiselect',
  'color',
  'slider',
  'slot',
  'hidden',
])

export type EditorControl = z.infer<typeof zEditorControlSchema>

/**
 * Full property definition
 * Includes type, default value, constraints, and editor hints.
 *
 * @example
 * ```json
 * {
 *   "type": "string",
 *   "default": "Click me",
 *   "required": true,
 *   "description": "Button label text",
 *   "editorControl": "text",
 *   "constraints": { "minLength": 1, "maxLength": 50 }
 * }
 * ```
 */
export const zComponentPropDefinitionSchema = z
  .object({
    /** The type of this prop */
    type: zPropTypeSchema.describe('The type of this prop'),

    /** Default value when not provided */
    default: z.unknown().optional().describe('Default value when not provided'),

    /** Is this prop required? */
    required: z.boolean().default(false).describe('Whether the prop is required'),

    /** Human-readable description */
    description: z.string().optional().describe('Human-readable description'),

    /** Mark as deprecated with optional message */
    deprecated: z
      .union([z.boolean(), z.string()])
      .optional()
      .describe('Deprecation status or message'),

    /** Hint for editor UI */
    editorControl: zEditorControlSchema
      .optional()
      .describe('Hint for editor UI control type'),

    /** Validation constraints */
    constraints: zPropConstraintsSchema
      .optional()
      .describe('Validation constraints'),

    /** Group props in the editor UI */
    group: z.string().optional().describe('Group name for organizing in editor'),
  })
  .describe('Full property definition')

export type ComponentPropDefinition = z.infer<typeof zComponentPropDefinitionSchema>

/**
 * Props definition for a component
 * Maps prop names to their definitions.
 */
export const zComponentPropsDefinitionSchema = z
  .record(z.string(), zComponentPropDefinitionSchema)
  .describe('Component props definitions')

export type ComponentPropsDefinition = z.infer<typeof zComponentPropsDefinitionSchema>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert a PropType to a TypeScript type string
 */
export function propTypeToTypeScript(type: PropType): string {
  if (type === 'string') return 'string'
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'boolean'
  if (type === 'ReactNode') return 'React.ReactNode'
  if (type === 'function') return '(...args: unknown[]) => void'
  if (type === 'any') return 'unknown'

  if (typeof type === 'object') {
    if ('enum' in type) {
      return type.enum.map((v) => `"${v}"`).join(' | ')
    }
    if ('array' in type) {
      return `Array<${propTypeToTypeScript(type.array)}>`
    }
    if ('object' in type) {
      const entries = Object.entries(type.object)
        .map(([k, v]) => `${k}: ${propTypeToTypeScript(v)}`)
        .join('; ')
      return `{ ${entries} }`
    }
    if ('union' in type) {
      return type.union.map(propTypeToTypeScript).join(' | ')
    }
  }

  return 'unknown'
}

/**
 * Get all required prop names from a props definition
 */
export function getRequiredProps(props: ComponentPropsDefinition): string[] {
  return Object.entries(props)
    .filter(([, def]) => def.required && def.default === undefined)
    .map(([name]) => name)
}

/**
 * Get default values for all props
 */
export function getDefaultPropValues(
  props: ComponentPropsDefinition,
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}
  for (const [name, def] of Object.entries(props)) {
    if (def.default !== undefined) {
      defaults[name] = def.default
    }
  }
  return defaults
}

/**
 * Validate a prop value against its definition
 */
export function validatePropValue(
  value: unknown,
  definition: ComponentPropDefinition,
  propName: string,
): string | null {
  const { type, constraints, required } = definition

  // Check required
  if (required && value === undefined) {
    return `Required prop "${propName}" is missing`
  }

  // Skip validation for undefined optional props
  if (value === undefined) return null

  // Type validation
  const typeError = validatePropType(value, type, propName)
  if (typeError) return typeError

  // Constraints validation
  if (constraints) {
    const constraintError = validatePropConstraints(value, constraints, propName)
    if (constraintError) return constraintError
  }

  return null
}

function validatePropType(value: unknown, type: PropType, propName: string): string | null {
  if (type === 'string' && typeof value !== 'string') {
    return `Prop "${propName}" expected string, got ${typeof value}`
  }
  if (type === 'number' && typeof value !== 'number') {
    return `Prop "${propName}" expected number, got ${typeof value}`
  }
  if (type === 'boolean' && typeof value !== 'boolean') {
    return `Prop "${propName}" expected boolean, got ${typeof value}`
  }
  if (type === 'any' || type === 'ReactNode' || type === 'function') {
    return null // Accept anything
  }

  if (typeof type === 'object') {
    if ('enum' in type) {
      if (typeof value !== 'string' || !type.enum.includes(value)) {
        return `Prop "${propName}" expected one of [${type.enum.join(', ')}], got "${value}"`
      }
    }
    if ('array' in type) {
      if (!Array.isArray(value)) {
        return `Prop "${propName}" expected array, got ${typeof value}`
      }
    }
    if ('object' in type) {
      if (typeof value !== 'object' || value === null) {
        return `Prop "${propName}" expected object, got ${typeof value}`
      }
    }
  }

  return null
}

function validatePropConstraints(
  value: unknown,
  constraints: PropConstraints,
  propName: string,
): string | null {
  if (typeof value === 'number') {
    if (constraints.min !== undefined && value < constraints.min) {
      return `Prop "${propName}" must be >= ${constraints.min}`
    }
    if (constraints.max !== undefined && value > constraints.max) {
      return `Prop "${propName}" must be <= ${constraints.max}`
    }
  }

  if (typeof value === 'string') {
    if (constraints.minLength !== undefined && value.length < constraints.minLength) {
      return `Prop "${propName}" must have length >= ${constraints.minLength}`
    }
    if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
      return `Prop "${propName}" must have length <= ${constraints.maxLength}`
    }
    if (constraints.pattern !== undefined && !new RegExp(constraints.pattern).test(value)) {
      return `Prop "${propName}" must match pattern ${constraints.pattern}`
    }
  }

  if (Array.isArray(value)) {
    if (constraints.minLength !== undefined && value.length < constraints.minLength) {
      return `Prop "${propName}" must have length >= ${constraints.minLength}`
    }
    if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
      return `Prop "${propName}" must have length <= ${constraints.maxLength}`
    }
  }

  return null
}
