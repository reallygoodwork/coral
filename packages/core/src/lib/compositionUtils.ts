import type { ComponentInstance } from '../structures/composition'
import {
  extractComponentName,
  findComponentInstances,
} from '../structures/composition'
import type { CoralNode, CoralRootNode } from '../structures/coral'
import type { SlotBinding } from '../structures/slots'
import { isSlotForward, isSlotPropReference } from '../structures/slots'
import type { LoadedPackage } from './packageLoader'
import { resolvePropBinding } from './resolveProps'

/**
 * Result of resolving a component instance
 */
export interface ResolvedInstance {
  /** The resolved component definition */
  component: CoralRootNode

  /** Props resolved from bindings */
  resolvedProps: Record<string, unknown>

  /** Slot content resolved from bindings */
  resolvedSlots: Record<string, CoralNode[]>
}

/**
 * Resolve a component instance to its full definition
 *
 * @param instance - The component instance to resolve
 * @param parentProps - Props from the parent component
 * @param parentSlots - Slot content from the parent component
 * @param pkg - Loaded package for component lookup
 * @returns Resolved instance with props and slots
 *
 * @example
 * ```ts
 * const resolved = resolveComponentInstance(
 *   buttonInstance,
 *   { intent: 'primary', label: 'Click me' },
 *   {},
 *   pkg
 * )
 *
 * console.log(resolved.resolvedProps) // { intent: 'primary', ... }
 * ```
 */
export function resolveComponentInstance(
  instance: ComponentInstance,
  parentProps: Record<string, unknown>,
  parentSlots: Record<string, CoralNode[]>,
  pkg: LoadedPackage,
): ResolvedInstance {
  // Find the referenced component
  const componentName = extractComponentName(instance.$component.ref)
  const component = pkg.components.get(componentName)

  if (!component) {
    throw new Error(`Component not found: ${instance.$component.ref}`)
  }

  // Resolve prop bindings
  const resolvedProps: Record<string, unknown> = {}

  // Start with defaults from component definition
  if (component.props) {
    for (const [propName, propDef] of Object.entries(component.props)) {
      if (propDef.default !== undefined) {
        resolvedProps[propName] = propDef.default
      }
    }
  }

  // Apply variant overrides as props
  if (instance.variantOverrides) {
    Object.assign(resolvedProps, instance.variantOverrides)
  }

  // Apply prop bindings
  if (instance.propBindings) {
    for (const [propName, binding] of Object.entries(instance.propBindings)) {
      resolvedProps[propName] = resolvePropBinding(binding, parentProps)
    }
  }

  // Resolve slot bindings
  const resolvedSlots: Record<string, CoralNode[]> = {}

  if (instance.slotBindings) {
    for (const [slotName, binding] of Object.entries(instance.slotBindings)) {
      resolvedSlots[slotName] = resolveSlotBinding(
        binding,
        parentProps,
        parentSlots,
      )
    }
  }

  return {
    component,
    resolvedProps,
    resolvedSlots,
  }
}

/**
 * Resolve a slot binding to its content
 */
function resolveSlotBinding(
  binding: SlotBinding,
  parentProps: Record<string, unknown>,
  parentSlots: Record<string, CoralNode[]>,
): CoralNode[] {
  // Static text content
  if (typeof binding === 'string') {
    return [
      {
        name: 'Text',
        elementType: 'span' as const,
        textContent: binding,
      },
    ]
  }

  // Prop reference - resolve to string and wrap in node
  if (isSlotPropReference(binding)) {
    const value = parentProps[binding.$prop]
    return [
      {
        name: 'Text',
        elementType: 'span' as const,
        textContent: String(value ?? ''),
      },
    ]
  }

  // Slot forwarding
  if (isSlotForward(binding)) {
    return parentSlots[binding.$slot] ?? []
  }

  // Type guard for CoralNode
  function isCoralNode(value: unknown): value is CoralNode {
    return (
      typeof value === 'object' &&
      value !== null &&
      'name' in value &&
      'elementType' in value
    )
  }

  // Array of nodes
  if (Array.isArray(binding)) {
    return binding.filter(isCoralNode)
  }

  // Single node
  if (isCoralNode(binding)) {
    return [binding]
  }

  return []
}

/**
 * Flatten a component tree, resolving all instances
 *
 * @param node - Root node to flatten
 * @param props - Current prop values
 * @param slots - Current slot content
 * @param pkg - Loaded package
 * @returns Flattened node tree with instances resolved
 */
export function flattenComponentTree(
  node: CoralNode,
  props: Record<string, unknown>,
  slots: Record<string, CoralNode[]>,
  pkg: LoadedPackage,
): CoralNode {
  if (
    node.type === 'COMPONENT_INSTANCE' &&
    '$component' in node &&
    typeof node.$component === 'object' &&
    node.$component !== null &&
    'ref' in node.$component &&
    typeof (node.$component as { ref: unknown }).ref === 'string'
  ) {
    // Create a ComponentInstance from the node
    // ComponentInstance requires 'id' but CoralNode doesn't have it, so we use name as id
    const instance: ComponentInstance = {
      id: node.name,
      name: node.name,
      type: 'COMPONENT_INSTANCE',
      $component: node.$component as ComponentInstance['$component'],
      propBindings: 'propBindings' in node ? node.propBindings : undefined,
      eventBindings: 'eventBindings' in node ? node.eventBindings : undefined,
      slotBindings: 'slotBindings' in node ? node.slotBindings : undefined,
      variantOverrides:
        'variantOverrides' in node ? node.variantOverrides : undefined,
      styleOverrides:
        'styleOverrides' in node ? node.styleOverrides : undefined,
    }
    const resolved = resolveComponentInstance(instance, props, slots, pkg)

    // Recursively flatten the resolved component's root
    return flattenComponentTree(
      resolved.component,
      resolved.resolvedProps,
      resolved.resolvedSlots,
      pkg,
    )
  }

  // Regular node - process children
  const flatNode: CoralNode = { ...node }

  // If this node is a slot target, inject slot content
  if (node.slotTarget) {
    const slotContent = slots[node.slotTarget]
    if (slotContent && slotContent.length > 0) {
      flatNode.children = slotContent.map((child) =>
        flattenComponentTree(child, props, slots, pkg),
      )
    } else if (node.slotFallback) {
      flatNode.children = node.slotFallback.map((child) =>
        flattenComponentTree(child, props, slots, pkg),
      )
    }
  } else if (node.children) {
    flatNode.children = node.children.map((child) =>
      flattenComponentTree(child, props, slots, pkg),
    )
  }

  return flatNode
}

/**
 * Get all component dependencies for a component
 *
 * @param component - Component to analyze
 * @returns Array of component reference paths
 */
export function getComponentDependencies(component: CoralRootNode): string[] {
  const deps = new Set<string>()

  function walk(node: CoralNode) {
    if (node.type === 'COMPONENT_INSTANCE' && node.$component) {
      deps.add(node.$component.ref)
    }

    if (node.children) {
      for (const child of node.children) {
        walk(child)
      }
    }

    if (node.slotFallback) {
      for (const fallback of node.slotFallback) {
        walk(fallback)
      }
    }
  }

  walk(component)
  return Array.from(deps)
}

/**
 * Validate component composition (no circular dependencies, etc.)
 *
 * @param pkg - Loaded package to validate
 * @returns Validation result
 */
export function validateComposition(pkg: LoadedPackage): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Build dependency graph
  const graph = new Map<string, Set<string>>()

  for (const [name, component] of pkg.components) {
    const deps = getComponentDependencies(component)
    graph.set(name, new Set(deps.map(extractComponentName)))
  }

  // Check for circular dependencies
  const visited = new Set<string>()
  const stack = new Set<string>()
  const path: string[] = []

  function hasCycle(name: string): boolean {
    if (stack.has(name)) {
      // Found cycle - extract it
      const cycleStart = path.indexOf(name)
      const cycle = [...path.slice(cycleStart), name]
      errors.push(`Circular dependency detected: ${cycle.join(' -> ')}`)
      return true
    }

    if (visited.has(name)) return false

    visited.add(name)
    stack.add(name)
    path.push(name)

    const deps = graph.get(name)
    if (deps) {
      for (const dep of deps) {
        hasCycle(dep)
      }
    }

    path.pop()
    stack.delete(name)
    return false
  }

  for (const name of graph.keys()) {
    hasCycle(name)
  }

  // Check for missing dependencies
  for (const [name, deps] of graph) {
    for (const dep of deps) {
      if (!pkg.components.has(dep)) {
        errors.push(`Component "${name}" references unknown component "${dep}"`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get topological sort order for components
 * (components with no dependencies first)
 *
 * @param pkg - Loaded package
 * @returns Array of component names in dependency order
 */
export function getComponentOrder(pkg: LoadedPackage): string[] {
  const graph = new Map<string, Set<string>>()

  for (const [name, component] of pkg.components) {
    const deps = getComponentDependencies(component)
    graph.set(name, new Set(deps.map(extractComponentName)))
  }

  const result: string[] = []
  const visited = new Set<string>()

  function visit(name: string) {
    if (visited.has(name)) return
    visited.add(name)

    const deps = graph.get(name)
    if (deps) {
      for (const dep of deps) {
        if (pkg.components.has(dep)) {
          visit(dep)
        }
      }
    }

    result.push(name)
  }

  for (const name of pkg.components.keys()) {
    visit(name)
  }

  return result
}

/**
 * Check if a component has any component instances
 */
export function hasComponentInstances(component: CoralRootNode): boolean {
  const instances = findComponentInstances(component)
  return instances.length > 0
}

/**
 * Count total component instances in a component
 */
export function countComponentInstances(component: CoralRootNode): number {
  const instances = findComponentInstances(component)
  return instances.length
}
