import * as z from 'zod'

import { zPropReferenceSchema } from './references'

/**
 * Slot definition - defines an insertion point in a component
 * Slots allow consumers to inject content into specific locations.
 *
 * @example
 * ```json
 * {
 *   "name": "default",
 *   "description": "Main content area",
 *   "required": true
 * }
 * ```
 *
 * @example With constraints:
 * ```json
 * {
 *   "name": "actions",
 *   "description": "Action buttons",
 *   "allowedElements": ["button"],
 *   "allowedComponents": ["Button", "IconButton"],
 *   "multiple": true
 * }
 * ```
 */
export const zSlotDefinitionSchema = z
  .object({
    /** Slot name - "default" is the primary children slot */
    name: z.string().describe('Slot name ("default" for primary children)'),

    /** Human-readable description */
    description: z.string().optional().describe('Slot description'),

    /** Allowed HTML element types */
    allowedElements: z
      .array(z.string())
      .optional()
      .describe('Allowed HTML element types'),

    /** Allowed Coral component types */
    allowedComponents: z
      .array(z.string())
      .optional()
      .describe('Allowed Coral component types'),

    /** Can this slot accept multiple children? */
    multiple: z
      .boolean()
      .default(true)
      .describe('Whether slot accepts multiple children'),

    /** Is content required for this slot? */
    required: z
      .boolean()
      .default(false)
      .describe('Whether content is required'),
  })
  .describe('Slot definition')

export type SlotDefinition = z.infer<typeof zSlotDefinitionSchema>

/**
 * Slot forward reference
 * Passes content from a parent slot to a child slot.
 *
 * @example
 * ```json
 * { "$slot": "header" }
 * ```
 */
export const zSlotForwardSchema = z
  .object({
    $slot: z.string().describe('Parent slot name to forward'),
  })
  .describe('Forward parent slot content')

export type SlotForward = z.infer<typeof zSlotForwardSchema>

/**
 * Slot binding - what content to pass to a slot
 * Can be a prop reference, static text, node(s), or slot forward.
 */
export const zSlotBindingSchema = z.lazy(() =>
  z.union([
    // Pass parent prop as slot content
    zPropReferenceSchema,

    // Pass static text
    z.string(),

    // Forward parent slot
    zSlotForwardSchema,

    // Pass a node or array of nodes (recursive, resolved at runtime)
    z.record(z.string(), z.unknown()),

    // Array of nodes
    z.array(z.record(z.string(), z.unknown())),
  ]),
)

export type SlotBinding = z.infer<typeof zSlotBindingSchema>

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a slot forward reference
 */
export function isSlotForward(value: unknown): value is SlotForward {
  return typeof value === 'object' && value !== null && '$slot' in value
}

/**
 * Check if a value is a prop reference (for slot content)
 */
export function isSlotPropReference(
  value: unknown,
): value is { $prop: string } {
  return typeof value === 'object' && value !== null && '$prop' in value
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get required slot names from slot definitions
 */
export function getRequiredSlots(slots: SlotDefinition[]): string[] {
  return slots.filter((s) => s.required).map((s) => s.name)
}

/**
 * Validate slot content against slot definition
 *
 * @param content - The slot content (node or array of nodes)
 * @param definition - The slot definition
 * @returns Array of validation errors (empty if valid)
 */
export function validateSlotContent(
  content: unknown,
  definition: SlotDefinition,
): string[] {
  const errors: string[] = []

  // Check required
  if (definition.required && (content === undefined || content === null)) {
    errors.push(`Required slot "${definition.name}" is empty`)
    return errors
  }

  // Check multiple
  if (!definition.multiple && Array.isArray(content) && content.length > 1) {
    errors.push(
      `Slot "${definition.name}" only accepts single child, got ${content.length}`,
    )
  }

  // Check allowed elements (if content is node-like)
  if (definition.allowedElements && content) {
    const nodes = Array.isArray(content) ? content : [content]
    for (const node of nodes) {
      if (
        typeof node === 'object' &&
        node !== null &&
        'elementType' in node &&
        typeof node.elementType === 'string'
      ) {
        if (!definition.allowedElements.includes(node.elementType)) {
          errors.push(
            `Slot "${definition.name}" does not allow element type "${node.elementType}". ` +
              `Allowed: ${definition.allowedElements.join(', ')}`,
          )
        }
      }
    }
  }

  // Check allowed components
  if (definition.allowedComponents && content) {
    const nodes = Array.isArray(content) ? content : [content]
    for (const node of nodes) {
      if (
        typeof node === 'object' &&
        node !== null &&
        'type' in node &&
        typeof node.type === 'string'
      ) {
        if (node.type === 'COMPONENT_INSTANCE' || node.type === 'INSTANCE') {
          // Would need to check component name against allowedComponents
          // This is a simplified check - full validation needs component resolution
        }
      }
    }
  }

  return errors
}

/**
 * Create a default slot definition for "default" slot
 */
export function createDefaultSlotDefinition(
  overrides?: Partial<SlotDefinition>,
): SlotDefinition {
  return {
    name: 'default',
    description: 'Default content slot',
    multiple: true,
    required: false,
    ...overrides,
  }
}

/**
 * Find slot definition by name
 */
export function findSlotDefinition(
  slots: SlotDefinition[],
  name: string,
): SlotDefinition | undefined {
  return slots.find((s) => s.name === name)
}

/**
 * Check if a node is a slot target (renders slot content)
 */
export function isSlotTarget(node: unknown): node is { slotTarget: string } {
  return (
    typeof node === 'object' &&
    node !== null &&
    'slotTarget' in node &&
    typeof node.slotTarget === 'string'
  )
}
