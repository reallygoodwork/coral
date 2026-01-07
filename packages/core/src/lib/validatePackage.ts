import {
  extractComponentName,
  findComponentInstances,
} from '../structures/composition'
import type { ConditionalExpression } from '../structures/conditional'
import type { CoralNode, CoralRootNode } from '../structures/coral'
import {
  isAssetReference,
  isComponentReference,
  isPropReference,
  isTokenReference,
} from '../structures/references'
import type { LoadedPackage } from './packageLoader'

/**
 * Validation error
 */
export interface ValidationError {
  type:
    | 'missing-token'
    | 'missing-component'
    | 'missing-asset'
    | 'missing-prop'
    | 'circular-ref'
    | 'invalid-variant'
  path: string
  reference: string
  message: string
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  type: 'deprecated-token' | 'deprecated-component' | 'unused-prop'
  path: string
  message: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

/**
 * Validate all references in a package
 *
 * @param pkg - Loaded package to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```ts
 * const pkg = await loadPackage('./my-design-system/coral.config.json', options)
 * const result = validatePackage(pkg)
 *
 * if (!result.valid) {
 *   for (const error of result.errors) {
 *     console.error(`${error.type}: ${error.message}`)
 *   }
 * }
 * ```
 */
export function validatePackage(pkg: LoadedPackage): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Build sets of known tokens, components, assets
  const knownTokens = new Set<string>()
  for (const [, tokenData] of pkg.tokens) {
    if (isRecord(tokenData)) {
      collectTokenPaths(tokenData, '', knownTokens)
    }
  }

  const knownComponents = new Set(pkg.components.keys())

  // Validate each component
  for (const [name, component] of pkg.components) {
    validateComponent(name, component, {
      knownTokens,
      knownComponents,
      errors,
      warnings,
    })
  }

  // Check for circular dependencies
  const circularErrors = validateCircularDependencies(pkg)
  errors.push(...circularErrors)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

interface ValidationContext {
  knownTokens: Set<string>
  knownComponents: Set<string>
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

function validateComponent(
  componentName: string,
  component: CoralRootNode,
  ctx: ValidationContext,
) {
  // Collect defined props
  const definedProps = new Set(Object.keys(component.props ?? {}))
  const definedComponentProps = new Set(
    Object.keys(component.componentProperties ?? {}),
  )
  const allDefinedProps = new Set([...definedProps, ...definedComponentProps])

  // Add variant axes as props
  if (component.componentVariants?.axes) {
    for (const axis of component.componentVariants.axes) {
      allDefinedProps.add(axis.name)
    }
  }

  // Validate variant definitions
  if (component.componentVariants?.axes) {
    for (const axis of component.componentVariants.axes) {
      if (!axis.values.includes(axis.default)) {
        ctx.errors.push({
          type: 'invalid-variant',
          path: `${componentName}/variants/${axis.name}`,
          reference: axis.default,
          message: `Default value "${axis.default}" is not in values: ${axis.values.join(', ')}`,
        })
      }
    }
  }

  // Validate node tree
  validateNode(componentName, component, allDefinedProps, ctx)
}

function validateNode(
  componentName: string,
  node: CoralNode,
  definedProps: Set<string>,
  ctx: ValidationContext,
) {
  const nodePath = `${componentName}/${node.name || node.elementType}`

  // Check styles for token references
  if (node.styles) {
    for (const [prop, value] of Object.entries(node.styles)) {
      validateStyleValue(value, `${nodePath}/styles/${prop}`, ctx, definedProps)
    }
  }

  // Check variant styles
  if (node.variantStyles) {
    for (const [axis, values] of Object.entries(node.variantStyles)) {
      for (const [variant, styles] of Object.entries(values)) {
        for (const [prop, value] of Object.entries(styles)) {
          validateStyleValue(
            value,
            `${nodePath}/variantStyles/${axis}/${variant}/${prop}`,
            ctx,
            definedProps,
          )
        }
      }
    }
  }

  // Check compound variant styles
  if (node.compoundVariantStyles) {
    for (let i = 0; i < node.compoundVariantStyles.length; i++) {
      const compound = node.compoundVariantStyles[i]
      if (compound) {
        for (const [prop, value] of Object.entries(compound.styles)) {
          validateStyleValue(
            value,
            `${nodePath}/compoundVariantStyles[${i}]/${prop}`,
            ctx,
            definedProps,
          )
        }
      }
    }
  }

  // Check conditional expressions
  if (node.conditional) {
    validateConditional(
      node.conditional,
      `${nodePath}/conditional`,
      definedProps,
      ctx,
    )
  }

  // Check conditional styles
  if (node.conditionalStyles) {
    for (let i = 0; i < node.conditionalStyles.length; i++) {
      const condStyle = node.conditionalStyles[i]
      if (condStyle) {
        validateConditional(
          condStyle.condition,
          `${nodePath}/conditionalStyles[${i}]/condition`,
          definedProps,
          ctx,
        )
      }
    }
  }

  // Check text content for prop references
  if (node.textContent && typeof node.textContent === 'object') {
    validateStyleValue(
      node.textContent,
      `${nodePath}/textContent`,
      ctx,
      definedProps,
    )
  }

  // Check component instances
  if (node.type === 'COMPONENT_INSTANCE' && node.$component) {
    const refName = extractComponentName(node.$component.ref)
    if (!ctx.knownComponents.has(refName)) {
      ctx.errors.push({
        type: 'missing-component',
        path: nodePath,
        reference: node.$component.ref,
        message: `Component "${refName}" not found`,
      })
    }
  }

  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      validateNode(componentName, child, definedProps, ctx)
    }
  }

  // Recurse into slot fallback
  if (node.slotFallback) {
    for (const fallback of node.slotFallback) {
      validateNode(componentName, fallback, definedProps, ctx)
    }
  }
}

function validateStyleValue(
  value: unknown,
  path: string,
  ctx: ValidationContext,
  definedProps: Set<string>,
) {
  if (isTokenReference(value)) {
    if (!ctx.knownTokens.has(value.$token)) {
      ctx.errors.push({
        type: 'missing-token',
        path,
        reference: value.$token,
        message: `Token "${value.$token}" not found`,
      })
    }
  }

  if (isPropReference(value)) {
    if (!definedProps.has(value.$prop)) {
      ctx.errors.push({
        type: 'missing-prop',
        path,
        reference: value.$prop,
        message: `Prop "${value.$prop}" is not defined on this component`,
      })
    }
  }

  if (isComponentReference(value)) {
    const ref = value.$component.ref
    const refName = extractComponentName(ref)
    if (!ctx.knownComponents.has(refName)) {
      ctx.errors.push({
        type: 'missing-component',
        path,
        reference: ref,
        message: `Component "${ref}" not found`,
      })
    }
  }

  if (isAssetReference(value)) {
    // Asset validation would need access to filesystem
    // For now, just skip
  }

  // Recurse into objects
  if (
    typeof value === 'object' &&
    value !== null &&
    !isAnyKnownReference(value)
  ) {
    for (const [key, nestedValue] of Object.entries(value)) {
      validateStyleValue(nestedValue, `${path}/${key}`, ctx, definedProps)
    }
  }
}

/**
 * Type guard for conditional expressions
 */
function isConditionalExpression(expr: unknown): expr is ConditionalExpression {
  if (typeof expr !== 'object' || expr === null) return false
  return (
    '$prop' in expr ||
    '$not' in expr ||
    '$and' in expr ||
    '$or' in expr ||
    '$eq' in expr ||
    '$ne' in expr
  )
}

function validateConditional(
  expr: unknown,
  path: string,
  definedProps: Set<string>,
  ctx: ValidationContext,
) {
  if (!isConditionalExpression(expr)) return

  if ('$prop' in expr) {
    if (!definedProps.has(expr.$prop)) {
      ctx.errors.push({
        type: 'missing-prop',
        path,
        reference: expr.$prop,
        message: `Prop "${expr.$prop}" used in conditional is not defined`,
      })
    }
  }

  if ('$not' in expr) {
    validateConditional(expr.$not, `${path}/$not`, definedProps, ctx)
  }

  if ('$and' in expr) {
    expr.$and.forEach((item, i) => {
      validateConditional(item, `${path}/$and[${i}]`, definedProps, ctx)
    })
  }

  if ('$or' in expr) {
    expr.$or.forEach((item, i) => {
      validateConditional(item, `${path}/$or[${i}]`, definedProps, ctx)
    })
  }

  if ('$eq' in expr) {
    const [left] = expr.$eq
    validateConditional(left, `${path}/$eq[0]`, definedProps, ctx)
  }

  if ('$ne' in expr) {
    const [left] = expr.$ne
    validateConditional(left, `${path}/$ne[0]`, definedProps, ctx)
  }
}

function validateCircularDependencies(pkg: LoadedPackage): ValidationError[] {
  const errors: ValidationError[] = []

  // Build dependency graph
  const graph = new Map<string, Set<string>>()

  for (const [name, component] of pkg.components) {
    const instances = findComponentInstances(component)
    const deps = new Set(
      instances.map((i) => extractComponentName(i.instance.$component.ref)),
    )
    graph.set(name, deps)
  }

  // Check for cycles using DFS
  const visited = new Set<string>()
  const stack = new Set<string>()
  const path: string[] = []

  function visit(name: string): boolean {
    if (stack.has(name)) {
      // Found cycle
      const cycleStart = path.indexOf(name)
      const cycle = [...path.slice(cycleStart), name]
      errors.push({
        type: 'circular-ref',
        path: cycle.join(' -> '),
        reference: name,
        message: `Circular dependency: ${cycle.join(' -> ')}`,
      })
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

  return errors
}

/**
 * Type guard to check if value is a record
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectTokenPaths(
  obj: Record<string, unknown>,
  prefix: string,
  result: Set<string>,
) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue

    const path = prefix ? `${prefix}.${key}` : key

    if (isRecord(value)) {
      if ('$value' in value) {
        result.add(path)
      } else {
        collectTokenPaths(value, path, result)
      }
    }
  }
}

function isAnyKnownReference(value: unknown): boolean {
  return (
    isTokenReference(value) ||
    isPropReference(value) ||
    isComponentReference(value) ||
    isAssetReference(value)
  )
}
