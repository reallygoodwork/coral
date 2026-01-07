import * as z from 'zod'

import { zEventBindingSchema } from './bindings'
import { zConditionalExpressionSchema } from './conditional'
import { zPropReferenceSchema } from './references'
import { zSlotBindingSchema } from './slots'
import { zCoralStyleSchema } from './styles'

/**
 * Reference to another Coral component
 *
 * @example
 * ```json
 * {
 *   "ref": "./button/button.coral.json",
 *   "version": "^1.0.0"
 * }
 * ```
 */
export const zComponentInstanceRefSchema = z
  .object({
    /** Path to component file (relative or package reference) */
    ref: z.string().describe('Path to component file'),

    /** Version constraint (for external packages) */
    version: z.string().optional().describe('Semver version constraint'),
  })
  .describe('Reference to another Coral component')

export type ComponentInstanceRef = z.infer<typeof zComponentInstanceRefSchema>

/**
 * Prop binding - static value or dynamic from parent prop
 */
export const zPropBindingSchema = z.union([
  z.unknown(), // Static value
  zPropReferenceSchema, // { $prop: "parentPropName" }
  z.object({
    $prop: z.string(),
    $transform: z.string().optional(),
  }),
])

export type PropBinding = z.infer<typeof zPropBindingSchema>

/**
 * Component instance node - a node that renders another component
 *
 * @example
 * ```json
 * {
 *   "id": "card-action",
 *   "name": "ActionButton",
 *   "type": "COMPONENT_INSTANCE",
 *   "$component": {
 *     "ref": "./button/button.coral.json"
 *   },
 *   "propBindings": {
 *     "intent": "secondary",
 *     "disabled": { "$prop": "actionDisabled" }
 *   },
 *   "slotBindings": {
 *     "default": { "$prop": "actionLabel" }
 *   }
 * }
 * ```
 */
export const zComponentInstanceSchema = z
  .object({
    id: z.string().describe('Unique identifier for the node'),
    name: z.string().describe('Human-readable name'),
    type: z.literal('COMPONENT_INSTANCE'),

    /** Reference to the component */
    $component: zComponentInstanceRefSchema.describe('Component reference'),

    /** Props to pass to the component */
    propBindings: z
      .record(z.string(), zPropBindingSchema)
      .optional()
      .describe('Props to pass to the component'),

    /** Events forwarded from the component */
    eventBindings: z
      .record(z.string(), zEventBindingSchema)
      .optional()
      .describe('Event bindings'),

    /** Slot content to pass to the component */
    slotBindings: z
      .record(z.string(), zSlotBindingSchema)
      .optional()
      .describe('Slot content to pass'),

    /** Override variant values (locks variant to specific value) */
    variantOverrides: z
      .record(z.string(), z.string())
      .optional()
      .describe('Override variant values'),

    /** Style overrides (applied to component root) */
    styleOverrides: zCoralStyleSchema
      .optional()
      .describe('Style overrides for component root'),

    /** Conditional rendering */
    conditional: zConditionalExpressionSchema
      .optional()
      .describe('Conditional rendering expression'),
  })
  .describe('Component instance node')

export type ComponentInstance = z.infer<typeof zComponentInstanceSchema>

/**
 * A component that is part of a compound component set
 *
 * @example
 * ```json
 * {
 *   "name": "Tab",
 *   "path": "./tab.coral.json",
 *   "role": "trigger",
 *   "description": "Individual tab trigger"
 * }
 * ```
 */
export const zComponentSetMemberSchema = z
  .object({
    /** Component name */
    name: z.string().describe('Component name'),

    /** Path to component file */
    path: z.string().describe('Path to component file'),

    /** Role in the set */
    role: z
      .enum(['root', 'container', 'item', 'content', 'trigger'])
      .optional()
      .describe('Role in the compound component'),

    /** Description of this member */
    description: z.string().optional().describe('Member description'),
  })
  .describe('Component set member')

export type ComponentSetMember = z.infer<typeof zComponentSetMemberSchema>

/**
 * Shared context property definition
 */
export const zSharedContextPropertySchema = z
  .object({
    type: z.string().describe('TypeScript type'),
    description: z.string().optional().describe('Property description'),
  })
  .describe('Shared context property')

export type SharedContextProperty = z.infer<typeof zSharedContextPropertySchema>

/**
 * Component set definition - groups related compound components
 * Example: Tabs (Tabs, TabList, Tab, TabPanels, TabPanel)
 *
 * @example
 * ```json
 * {
 *   "name": "Tabs",
 *   "version": "1.0.0",
 *   "description": "Tabbed interface components",
 *   "members": [
 *     { "name": "Tabs", "path": "./tabs.coral.json", "role": "root" },
 *     { "name": "TabList", "path": "./tab-list.coral.json", "role": "container" },
 *     { "name": "Tab", "path": "./tab.coral.json", "role": "trigger" },
 *     { "name": "TabPanel", "path": "./tab-panel.coral.json", "role": "content" }
 *   ],
 *   "sharedContext": {
 *     "properties": {
 *       "activeTab": { "type": "string", "description": "Currently active tab ID" }
 *     }
 *   }
 * }
 * ```
 */
export const zComponentSetSchema = z
  .object({
    $schema: z.string().optional(),

    /** Set name */
    name: z.string().describe('Component set name'),

    /** Set version */
    version: z.string().describe('Semver version'),

    /** Description */
    description: z.string().optional().describe('Set description'),

    /** Member components */
    members: z.array(zComponentSetMemberSchema).describe('Member components'),

    /** Shared context/state between members */
    sharedContext: z
      .object({
        /** Context properties available to all members */
        properties: z
          .record(z.string(), zSharedContextPropertySchema)
          .optional()
          .describe('Shared context properties'),
      })
      .optional()
      .describe('Shared context configuration'),

    /** Usage example */
    example: z.string().optional().describe('Usage example code'),
  })
  .describe('Component set definition')

export type ComponentSet = z.infer<typeof zComponentSetSchema>

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a node is a component instance
 */
export function isComponentInstance(node: unknown): node is ComponentInstance {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'COMPONENT_INSTANCE' &&
    '$component' in node
  )
}

/**
 * Check if a binding is a prop reference
 */
export function isPropBinding(value: unknown): value is { $prop: string } {
  return typeof value === 'object' && value !== null && '$prop' in value
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract component name from a reference path
 * "./button/button.coral.json" -> "Button"
 */
export function extractComponentName(ref: string): string {
  const match = ref.match(/([^/]+)\.coral\.json$/)
  if (match?.[1]) {
    return toPascalCase(match[1])
  }
  return ref
}

/**
 * Convert kebab-case or snake_case to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * Convert PascalCase to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

/**
 * Get all component references from a component instance
 */
export function getInstanceDependencies(instance: ComponentInstance): string[] {
  return [instance.$component.ref]
}

/**
 * Find all component instances in a node tree
 */
export function findComponentInstances(
  node: unknown,
  path = 'root',
): Array<{ instance: ComponentInstance; path: string }> {
  const results: Array<{ instance: ComponentInstance; path: string }> = []

  if (!node || typeof node !== 'object') return results

  if (isComponentInstance(node)) {
    results.push({ instance: node, path })
  }

  // Type guard for nodes with children
  function hasChildren(n: unknown): n is { children: unknown[] } {
    return (
      typeof n === 'object' &&
      n !== null &&
      'children' in n &&
      Array.isArray(n.children)
    )
  }

  // Type guard for nodes with slotFallback
  function hasSlotFallback(n: unknown): n is { slotFallback: unknown[] } {
    return (
      typeof n === 'object' &&
      n !== null &&
      'slotFallback' in n &&
      Array.isArray(n.slotFallback)
    )
  }

  // Check children
  if (hasChildren(node)) {
    for (let i = 0; i < node.children.length; i++) {
      results.push(
        ...findComponentInstances(node.children[i], `${path}/children[${i}]`),
      )
    }
  }

  // Check slot fallback
  if (hasSlotFallback(node)) {
    for (let i = 0; i < node.slotFallback.length; i++) {
      results.push(
        ...findComponentInstances(
          node.slotFallback[i],
          `${path}/slotFallback[${i}]`,
        ),
      )
    }
  }

  return results
}

/**
 * Build dependency graph for components
 */
export function buildDependencyGraph(
  components: Map<string, { root: unknown }>,
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>()

  for (const [name, component] of components) {
    const instances = findComponentInstances(component.root)
    const deps = new Set(
      instances.map((i) => extractComponentName(i.instance.$component.ref)),
    )
    graph.set(name, deps)
  }

  return graph
}

/**
 * Check for circular dependencies in component graph
 */
export function findCircularDependencies(
  graph: Map<string, Set<string>>,
): string[][] {
  const cycles: string[][] = []
  const visited = new Set<string>()
  const stack = new Set<string>()
  const path: string[] = []

  function visit(name: string): boolean {
    if (stack.has(name)) {
      // Found cycle - extract it
      const cycleStart = path.indexOf(name)
      if (cycleStart >= 0) {
        cycles.push([...path.slice(cycleStart), name])
      }
      return true
    }

    if (visited.has(name)) return false

    visited.add(name)
    stack.add(name)
    path.push(name)

    const deps = graph.get(name)
    if (deps) {
      for (const dep of deps) {
        visit(dep)
      }
    }

    path.pop()
    stack.delete(name)
    return false
  }

  for (const name of graph.keys()) {
    visit(name)
  }

  return cycles
}
