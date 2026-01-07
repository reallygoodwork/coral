import * as z from 'zod'

/**
 * Event parameter definition
 * Describes a parameter passed to an event handler.
 *
 * @example
 * ```json
 * {
 *   "name": "event",
 *   "type": "React.MouseEvent<HTMLButtonElement>",
 *   "description": "The click event object",
 *   "optional": false
 * }
 * ```
 */
export const zEventParameterSchema = z
  .object({
    /** Parameter name */
    name: z.string().describe('Parameter name'),

    /** TypeScript type as string */
    type: z.string().describe('TypeScript type (as string)'),

    /** Description */
    description: z.string().optional().describe('Parameter description'),

    /** Is this parameter optional? */
    optional: z
      .boolean()
      .default(false)
      .describe('Whether parameter is optional'),
  })
  .describe('Event parameter definition')

export type EventParameter = z.infer<typeof zEventParameterSchema>

/**
 * Event definition
 * Describes an event that a component can emit.
 *
 * @example
 * ```json
 * {
 *   "description": "Fired when button is clicked",
 *   "parameters": [
 *     { "name": "event", "type": "React.MouseEvent<HTMLButtonElement>" }
 *   ]
 * }
 * ```
 */
export const zComponentEventDefinitionSchema = z
  .object({
    /** Human-readable description */
    description: z.string().optional().describe('Event description'),

    /** Parameters passed to the handler */
    parameters: z
      .array(zEventParameterSchema)
      .default([])
      .describe('Parameters passed to the event handler'),

    /** Mark as deprecated */
    deprecated: z
      .union([z.boolean(), z.string()])
      .optional()
      .describe('Deprecation status or message'),
  })
  .describe('Event definition')

export type ComponentEventDefinition = z.infer<
  typeof zComponentEventDefinitionSchema
>

/**
 * Events definition for a component
 * Maps event names to their definitions.
 *
 * @example
 * ```json
 * {
 *   "onClick": {
 *     "description": "Fired when button is clicked",
 *     "parameters": [
 *       { "name": "event", "type": "React.MouseEvent<HTMLButtonElement>" }
 *     ]
 *   },
 *   "onFocus": {
 *     "description": "Fired when button receives focus",
 *     "parameters": [
 *       { "name": "event", "type": "React.FocusEvent<HTMLButtonElement>" }
 *     ]
 *   }
 * }
 * ```
 */
export const zComponentEventsDefinitionSchema = z
  .record(z.string(), zComponentEventDefinitionSchema)
  .describe('Component events definitions')

export type ComponentEventsDefinition = z.infer<
  typeof zComponentEventsDefinitionSchema
>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert an event definition to a TypeScript function type
 *
 * @param event - The event definition
 * @returns TypeScript type string for the event handler
 */
export function eventToTypeScript(event: ComponentEventDefinition): string {
  if (!event.parameters || event.parameters.length === 0) {
    return '() => void'
  }

  const params = event.parameters
    .map((p) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)
    .join(', ')

  return `(${params}) => void`
}

/**
 * Get all event handler prop names from events definition
 * (useful for filtering props that are event handlers)
 */
export function getEventPropNames(events: ComponentEventsDefinition): string[] {
  return Object.keys(events)
}

/**
 * Check if a prop name looks like an event handler
 * (starts with 'on' followed by uppercase letter)
 */
export function isEventHandlerName(name: string): boolean {
  return /^on[A-Z]/.test(name)
}

/**
 * Generate JSDoc comment for an event
 */
export function generateEventJSDoc(event: ComponentEventDefinition): string {
  const lines: string[] = ['/**']

  if (event.description) {
    lines.push(` * ${event.description}`)
  }

  if (event.deprecated) {
    const msg = typeof event.deprecated === 'string' ? event.deprecated : ''
    lines.push(` * @deprecated ${msg}`)
  }

  if (event.parameters && event.parameters.length > 0) {
    for (const param of event.parameters) {
      const optional = param.optional ? '[optional] ' : ''
      const desc = param.description ? ` - ${param.description}` : ''
      lines.push(` * @param ${param.name} ${optional}${param.type}${desc}`)
    }
  }

  lines.push(' */')

  return lines.join('\n')
}
