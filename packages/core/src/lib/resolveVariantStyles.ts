import type { CoralNode } from '../structures/coral'
import type { CoralStyleType } from '../structures/styles'
import type {
  CompoundVariantStyle,
  NodeVariantStyles,
  StateStyles,
} from '../structures/variantStyles'

/**
 * Active variant context - maps axis names to their current values
 */
export interface VariantContext {
  [axisName: string]: string // e.g., { intent: "primary", size: "md" }
}

/**
 * Resolve all styles for a node given active variants
 *
 * @param node - The node to resolve styles for
 * @param activeVariants - The currently active variant values
 * @returns Merged styles with variant overrides applied
 *
 * @example
 * ```ts
 * const node = {
 *   styles: { backgroundColor: '#ffffff' },
 *   variantStyles: {
 *     intent: {
 *       primary: { backgroundColor: '#007bff' },
 *       secondary: { backgroundColor: '#6c757d' },
 *     },
 *   },
 * }
 *
 * const styles = resolveNodeStyles(node, { intent: 'primary' })
 * // { backgroundColor: '#007bff' }
 * ```
 */
export function resolveNodeStyles(
  node: CoralNode,
  activeVariants: VariantContext,
): Partial<CoralStyleType> {
  // Start with base styles
  let resolved: Partial<CoralStyleType> = { ...node.styles }

  // Apply variant styles in order
  if (node.variantStyles) {
    for (const [axisName, axisValue] of Object.entries(activeVariants)) {
      const variantOverrides = node.variantStyles[axisName]?.[axisValue]
      if (variantOverrides) {
        resolved = { ...resolved, ...variantOverrides }
      }
    }
  }

  // Apply compound variant styles
  if (node.compoundVariantStyles) {
    for (const compound of node.compoundVariantStyles) {
      const matches = Object.entries(compound.conditions).every(
        ([axis, value]) => activeVariants[axis] === value,
      )
      if (matches) {
        resolved = { ...resolved, ...compound.styles }
      }
    }
  }

  return resolved
}

/**
 * Resolve styles for an entire node tree
 *
 * @param node - Root node of the tree
 * @param activeVariants - Currently active variant values
 * @returns Map of node IDs to their resolved styles
 */
export function resolveTreeStyles(
  node: CoralNode,
  activeVariants: VariantContext,
): Map<string, Partial<CoralStyleType>> {
  const result = new Map<string, Partial<CoralStyleType>>()

  function walk(n: CoralNode) {
    const nodeId = (n as CoralNode & { id?: string }).id ?? n.name
    result.set(nodeId, resolveNodeStyles(n, activeVariants))

    if (n.children) {
      for (const child of n.children) {
        walk(child)
      }
    }

    if (n.slotFallback) {
      for (const fallback of n.slotFallback) {
        walk(fallback)
      }
    }
  }

  walk(node)
  return result
}

/**
 * Get state-specific styles for a node
 *
 * @param node - The node to get state styles for
 * @param state - The state to get styles for (hover, focus, etc.)
 * @param activeVariants - Currently active variant values
 * @returns Resolved state styles
 */
export function resolveStateStyles(
  node: CoralNode,
  state: keyof StateStyles,
  activeVariants: VariantContext,
): Partial<CoralStyleType> | undefined {
  if (!node.stateStyles) return undefined

  const stateStyles = node.stateStyles[state]
  if (!stateStyles) return undefined

  // Check if variant-aware state styles
  if (isVariantAwareStateStyles(stateStyles)) {
    let resolved: Partial<CoralStyleType> = {}

    for (const [axisName, axisValue] of Object.entries(activeVariants)) {
      const variantOverrides = (stateStyles as NodeVariantStyles)[axisName]?.[axisValue]
      if (variantOverrides) {
        resolved = { ...resolved, ...variantOverrides }
      }
    }

    return Object.keys(resolved).length > 0 ? resolved : undefined
  }

  // Simple state styles
  return stateStyles as Partial<CoralStyleType>
}

/**
 * Check if state styles are variant-aware
 */
function isVariantAwareStateStyles(
  styles: unknown,
): styles is NodeVariantStyles {
  if (typeof styles !== 'object' || styles === null) {
    return false
  }

  // Check if first key value is an object with string values (variant axis)
  // vs an object with style values (direct styles)
  const firstKey = Object.keys(styles)[0]
  if (!firstKey) return false

  const firstValue = (styles as Record<string, unknown>)[firstKey]
  if (typeof firstValue !== 'object' || firstValue === null) {
    return false
  }

  // If the nested value is also an object, it's variant-aware
  const nestedKey = Object.keys(firstValue)[0]
  if (!nestedKey) return false

  const nestedValue = (firstValue as Record<string, unknown>)[nestedKey]
  return typeof nestedValue === 'object' && nestedValue !== null
}

/**
 * Get all styles for a node including state styles
 *
 * @param node - The node to get styles for
 * @param activeVariants - Currently active variant values
 * @returns Object with base, hover, focus, active, disabled styles
 */
export function getAllNodeStyles(
  node: CoralNode,
  activeVariants: VariantContext,
): {
  base: Partial<CoralStyleType>
  hover?: Partial<CoralStyleType>
  focus?: Partial<CoralStyleType>
  active?: Partial<CoralStyleType>
  disabled?: Partial<CoralStyleType>
  focusVisible?: Partial<CoralStyleType>
} {
  return {
    base: resolveNodeStyles(node, activeVariants),
    hover: resolveStateStyles(node, 'hover', activeVariants),
    focus: resolveStateStyles(node, 'focus', activeVariants),
    active: resolveStateStyles(node, 'active', activeVariants),
    disabled: node.stateStyles?.disabled as Partial<CoralStyleType> | undefined,
    focusVisible: resolveStateStyles(node, 'focusVisible', activeVariants),
  }
}

/**
 * Merge variant styles into base styles for all combinations
 * Useful for generating CSS with all variant classes
 *
 * @param node - The node to process
 * @param axes - Variant axes definitions
 * @returns Map of variant combination keys to styles
 *
 * @example
 * ```ts
 * const styleMap = generateVariantStyleMap(node, [
 *   { name: 'intent', values: ['primary', 'secondary'] },
 *   { name: 'size', values: ['sm', 'md'] },
 * ])
 *
 * // Map {
 * //   'intent-primary': { backgroundColor: '#007bff' },
 * //   'intent-secondary': { backgroundColor: '#6c757d' },
 * //   'size-sm': { padding: '4px 8px' },
 * //   'size-md': { padding: '8px 16px' },
 * // }
 * ```
 */
export function generateVariantStyleMap(
  node: CoralNode,
  axes: Array<{ name: string; values: string[] }>,
): Map<string, Partial<CoralStyleType>> {
  const result = new Map<string, Partial<CoralStyleType>>()

  if (!node.variantStyles) return result

  for (const axis of axes) {
    const axisStyles = node.variantStyles[axis.name]
    if (!axisStyles) continue

    for (const value of axis.values) {
      const styles = axisStyles[value]
      if (styles) {
        result.set(`${axis.name}-${value}`, styles)
      }
    }
  }

  return result
}

/**
 * Generate CSS class name for variant combination
 *
 * @param variants - Active variant values
 * @param prefix - Optional prefix for class names
 * @returns Space-separated class names
 */
export function variantsToClassName(
  variants: VariantContext,
  prefix = '',
): string {
  return Object.entries(variants)
    .map(([axis, value]) => (prefix ? `${prefix}-${axis}-${value}` : `${axis}-${value}`))
    .join(' ')
}
