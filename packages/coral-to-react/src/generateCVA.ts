/**
 * Generate Class Variance Authority (CVA) configuration from Coral variants
 */

import type {
  ComponentVariants,
  CoralNode,
  CoralRootNode,
  CoralStyleType,
  NodeVariantStyles,
  StateStyles,
} from '@reallygoodwork/coral-core'
import { styleToTailwind } from '@reallygoodwork/style-to-tailwind'

/**
 * CVA configuration object structure
 */
export interface CVAConfig {
  base?: string
  variants?: Record<string, Record<string, string>>
  compoundVariants?: Array<
    Record<string, string | string[]> & {
      class?: string
      className?: string
    }
  >
  defaultVariants?: Record<string, string>
}

/**
 * Options for CVA generation
 */
export interface GenerateCVAOptions {
  /** Node ID to generate CVA for (defaults to root) */
  nodeId?: string
  /** Include state styles (hover, focus, etc.) as separate CVA configs */
  includeStates?: boolean
}

/**
 * Result of CVA generation
 */
export interface CVAGenerationResult {
  /** Main CVA config */
  config: CVAConfig
  /** State-specific CVA configs (if includeStates: true) */
  stateConfigs?: {
    hover?: CVAConfig
    focus?: CVAConfig
    active?: CVAConfig
    disabled?: CVAConfig
    focusVisible?: CVAConfig
  }
  /** Import statements needed */
  imports: string[]
  /** CVA function call code */
  code: string
}

/**
 * Generate CVA configuration from Coral component variants
 *
 * @param spec - The Coral component specification
 * @param options - Generation options
 * @returns CVA configuration and code
 *
 * @example
 * ```ts
 * const result = generateCVA(buttonSpec)
 * // result.code:
 * // const buttonVariants = cva('px-4 py-2 rounded', {
 * //   variants: {
 * //     intent: {
 * //       primary: 'bg-blue-500 text-white',
 * //       secondary: 'bg-gray-500 text-white'
 * //     },
 * //     size: {
 * //       sm: 'text-sm px-2 py-1',
 * //       md: 'text-base px-4 py-2',
 * //       lg: 'text-lg px-6 py-3'
 * //     }
 * //   },
 * //   defaultVariants: {
 * //     intent: 'primary',
 * //     size: 'md'
 * //   }
 * // })
 * ```
 */
export function generateCVA(
  spec: CoralRootNode,
  options: GenerateCVAOptions = {},
): CVAGenerationResult {
  const { nodeId, includeStates = false } = options

  // Find the target node (default to root)
  const node = nodeId ? findNodeById(spec, nodeId) : spec

  if (!node) {
    throw new Error(`Node with id "${nodeId}" not found`)
  }

  // Check if component has variants
  const hasVariants =
    spec.componentVariants?.axes && spec.componentVariants.axes.length > 0

  if (!hasVariants) {
    // No variants - just return base styles
    const baseClasses = node.styles
      ? styleToTailwind(node.styles).join(' ')
      : ''

    // But still handle state styles if requested
    let stateConfigs: CVAGenerationResult['stateConfigs']
    if (includeStates && node.stateStyles) {
      stateConfigs = generateStateCVAConfigsNoVariants(node)
    }

    return {
      config: { base: baseClasses },
      stateConfigs,
      imports: [],
      code: `const componentVariants = cva('${baseClasses}')`,
    }
  }

  // Generate base config
  if (!spec.componentVariants) {
    throw new Error('Component variants are required but not found')
  }
  const config = generateCVAConfig(node, spec.componentVariants)

  // Generate state configs if requested
  let stateConfigs: CVAGenerationResult['stateConfigs']
  if (includeStates && node.stateStyles) {
    stateConfigs = generateStateCVAConfigs(node, spec.componentVariants)
  }

  // Generate imports
  const imports = [
    "import { cva } from 'class-variance-authority'",
    "import { cn } from '@/lib/utils'", // Assuming standard cn helper location
  ]

  // Generate CVA function call code
  const code = generateCVACode(config)

  return {
    config,
    stateConfigs,
    imports,
    code,
  }
}

/**
 * Generate CVA config object from node and variants
 */
function generateCVAConfig(
  node: CoralNode,
  componentVariants: ComponentVariants,
): CVAConfig {
  const config: CVAConfig = {}

  // Base styles from node.styles
  if (node.styles) {
    const baseClasses = styleToTailwind(node.styles)
    config.base = baseClasses.join(' ')
  }

  // Variant styles from node.variantStyles
  if (node.variantStyles && componentVariants.axes) {
    config.variants = {}

    for (const axis of componentVariants.axes) {
      const axisStyles = node.variantStyles[axis.name]
      if (!axisStyles) continue

      config.variants[axis.name] = {}

      for (const value of axis.values) {
        const valueStyles = axisStyles[value]
        if (valueStyles && config.variants) {
          const axisVariant = config.variants[axis.name]
          if (axisVariant) {
            const classes = styleToTailwind(valueStyles)
            axisVariant[value] = classes.join(' ')
          }
        }
      }
    }
  }

  // Compound variant styles
  if (node.compoundVariantStyles && node.compoundVariantStyles.length > 0) {
    config.compoundVariants = []

    for (const compound of node.compoundVariantStyles) {
      const classes = styleToTailwind(compound.styles)
      config.compoundVariants.push({
        ...compound.conditions,
        class: classes.join(' '),
      })
    }
  }

  // Default variants
  if (componentVariants.axes && componentVariants.axes.length > 0) {
    config.defaultVariants = {}
    for (const axis of componentVariants.axes) {
      config.defaultVariants[axis.name] = axis.default
    }
  }

  return config
}

/**
 * Generate CVA configs for state styles (for components WITHOUT variants)
 */
function generateStateCVAConfigsNoVariants(
  node: CoralNode,
): CVAGenerationResult['stateConfigs'] {
  if (!node.stateStyles) return undefined

  const stateConfigs: NonNullable<CVAGenerationResult['stateConfigs']> = {}
  const states: Array<keyof StateStyles> = [
    'hover',
    'focus',
    'active',
    'disabled',
    'focusVisible',
  ]

  for (const state of states) {
    const stateStyle = node.stateStyles[state]
    if (!stateStyle) continue

    // For components without variants, all state styles are simple
    // TypeScript knows stateStyle is CoralStyleType here since we're in the no-variants function
    const classes = styleToTailwind(stateStyle as CoralStyleType)
    const config: CVAConfig = {
      base: classes.join(' '),
    }
    // Type-safe assignment using type assertion for the specific state key
    if (state === 'hover') {
      stateConfigs.hover = config
    } else if (state === 'focus') {
      stateConfigs.focus = config
    } else if (state === 'active') {
      stateConfigs.active = config
    } else if (state === 'disabled') {
      stateConfigs.disabled = config
    } else if (state === 'focusVisible') {
      stateConfigs.focusVisible = config
    }
  }

  return Object.keys(stateConfigs).length > 0 ? stateConfigs : undefined
}

/**
 * Generate CVA configs for state styles (for components WITH variants)
 */
function generateStateCVAConfigs(
  node: CoralNode,
  componentVariants: ComponentVariants,
): CVAGenerationResult['stateConfigs'] {
  if (!node.stateStyles) return undefined

  const stateConfigs: NonNullable<CVAGenerationResult['stateConfigs']> = {}
  const states: Array<keyof StateStyles> = [
    'hover',
    'focus',
    'active',
    'disabled',
    'focusVisible',
  ]

  for (const state of states) {
    const stateStyle = node.stateStyles[state]
    if (!stateStyle) continue

    // Check if state styles are variant-aware
    if (isVariantAwareStateStyles(stateStyle)) {
      // Generate CVA config for variant-aware state
      const stateNode: CoralNode = {
        ...node,
        styles: undefined,
        variantStyles: stateStyle as NodeVariantStyles,
      }
      const config = generateCVAConfig(stateNode, componentVariants)
      // Type-safe assignment using type assertion for the specific state key
      if (state === 'hover') {
        stateConfigs.hover = config
      } else if (state === 'focus') {
        stateConfigs.focus = config
      } else if (state === 'active') {
        stateConfigs.active = config
      } else if (state === 'disabled') {
        stateConfigs.disabled = config
      } else if (state === 'focusVisible') {
        stateConfigs.focusVisible = config
      }
    } else {
      // Simple state styles (not variant-aware)
      // TypeScript knows stateStyle is CoralStyleType here since it's not variant-aware
      const classes = styleToTailwind(stateStyle as CoralStyleType)
      const config: CVAConfig = {
        base: classes.join(' '),
      }
      // Type-safe assignment using type assertion for the specific state key
      if (state === 'hover') {
        stateConfigs.hover = config
      } else if (state === 'focus') {
        stateConfigs.focus = config
      } else if (state === 'active') {
        stateConfigs.active = config
      } else if (state === 'disabled') {
        stateConfigs.disabled = config
      } else if (state === 'focusVisible') {
        stateConfigs.focusVisible = config
      }
    }
  }

  return Object.keys(stateConfigs).length > 0 ? stateConfigs : undefined
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

  // Common CSS property names - if we see these, it's NOT variant-aware
  const cssProperties = new Set([
    'backgroundColor',
    'color',
    'borderColor',
    'fontSize',
    'fontWeight',
    'padding',
    'margin',
    'width',
    'height',
    'opacity',
    'display',
    'position',
    'borderRadius',
    'borderWidth',
    'gap',
    'flexDirection',
  ])

  const firstKey = Object.keys(styles)[0]
  if (!firstKey) return false

  // If first key is a known CSS property, it's direct styles (NOT variant-aware)
  if (cssProperties.has(firstKey)) {
    return false
  }

  // Otherwise, check if it looks like variant axes
  // Variant axes have objects with multiple variant values
  const firstValue = (styles as Record<string, unknown>)[firstKey]
  if (typeof firstValue !== 'object' || firstValue === null) {
    return false
  }

  // Check if the nested level contains style objects (not color/dimension objects)
  const nestedKeys = Object.keys(firstValue)
  if (nestedKeys.length === 0) return false

  // If nested object has 'hex', 'r', 'g', 'b' keys, it's a color object (NOT variant-aware)
  if (
    'hex' in firstValue ||
    ('r' in firstValue && 'g' in firstValue && 'b' in firstValue)
  ) {
    return false
  }

  // At this point, it's likely variant-aware (e.g., { intent: { primary: {...}, secondary: {...} } })
  return true
}

/**
 * Generate CVA function call code from config
 */
function generateCVACode(config: CVAConfig): string {
  const lines: string[] = ['const componentVariants = cva(']

  // Base classes
  if (config.base) {
    lines.push(`  '${config.base}',`)
  } else {
    lines.push(`  '',`)
  }

  // Options object
  lines.push('  {')

  // Variants
  if (config.variants && Object.keys(config.variants).length > 0) {
    lines.push('    variants: {')
    for (const [axisName, axisValues] of Object.entries(config.variants)) {
      lines.push(`      ${axisName}: {`)
      for (const [value, classes] of Object.entries(axisValues)) {
        lines.push(`        ${value}: '${classes}',`)
      }
      lines.push('      },')
    }
    lines.push('    },')
  }

  // Compound variants
  if (config.compoundVariants && config.compoundVariants.length > 0) {
    lines.push('    compoundVariants: [')
    for (const compound of config.compoundVariants) {
      lines.push('      {')
      for (const [key, value] of Object.entries(compound)) {
        if (key === 'class' || key === 'className') {
          lines.push(`        ${key}: '${value}',`)
        } else {
          lines.push(`        ${key}: '${value}',`)
        }
      }
      lines.push('      },')
    }
    lines.push('    ],')
  }

  // Default variants
  if (
    config.defaultVariants &&
    Object.keys(config.defaultVariants).length > 0
  ) {
    lines.push('    defaultVariants: {')
    for (const [axis, value] of Object.entries(config.defaultVariants)) {
      lines.push(`      ${axis}: '${value}',`)
    }
    lines.push('    },')
  }

  lines.push('  },')
  lines.push(')')

  return lines.join('\n')
}

/**
 * Find a node by ID in the tree
 */
function findNodeById(node: CoralNode, id: string): CoralNode | null {
  // Check if current node has matching id
  const nodeWithId = node as CoralNode & { id?: string }
  if (nodeWithId.id === id) return node
  if (node.name === id) return node

  // Search children
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }

  // Search slot fallbacks
  if (node.slotFallback) {
    for (const fallback of node.slotFallback) {
      const found = findNodeById(fallback, id)
      if (found) return found
    }
  }

  return null
}

/**
 * Generate the cn helper function utility
 * This is commonly used with CVA for merging classes
 */
export function generateCNHelper(): string {
  return `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
}
