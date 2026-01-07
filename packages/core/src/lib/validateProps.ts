import {
  extractComponentName,
  findComponentInstances,
  isPropBinding,
} from '../structures/composition'
import type { ConditionalExpression } from '../structures/conditional'
import type { CoralNode, CoralRootNode } from '../structures/coral'
import type { ComponentPropsDefinition } from '../structures/props'
import { isPropReference } from '../structures/references'
import type { LoadedPackage } from './packageLoader'

/**
 * Prop validation error
 */
export interface PropValidationError {
  type:
    | 'missing-required'
    | 'type-mismatch'
    | 'invalid-enum'
    | 'constraint-violation'
  componentName: string
  propName: string
  message: string
  path: string
}

/**
 * Prop validation warning
 */
export interface PropValidationWarning {
  type: 'deprecated-prop' | 'unused-prop'
  componentName: string
  propName: string
  message: string
}

/**
 * Prop validation result
 */
export interface PropValidationResult {
  valid: boolean
  errors: PropValidationError[]
  warnings: PropValidationWarning[]
}

/**
 * Validate all prop bindings in a package
 *
 * @param pkg - Loaded package to validate
 * @returns Validation result
 *
 * @example
 * ```ts
 * const pkg = await loadPackage('./design-system/coral.config.json', options)
 * const result = validateProps(pkg)
 *
 * if (!result.valid) {
 *   for (const error of result.errors) {
 *     console.error(`[${error.type}] ${error.path}: ${error.message}`)
 *   }
 * }
 * ```
 */
export function validateProps(pkg: LoadedPackage): PropValidationResult {
  const errors: PropValidationError[] = []
  const warnings: PropValidationWarning[] = []

  for (const [componentName, component] of pkg.components) {
    validateComponentProps(componentName, component, pkg, errors, warnings)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateComponentProps(
  componentName: string,
  component: CoralRootNode,
  pkg: LoadedPackage,
  errors: PropValidationError[],
  warnings: PropValidationWarning[],
) {
  // Find all component instances in the tree
  const instances = findComponentInstances(component)

  for (const { instance, path } of instances) {
    const refName = extractComponentName(instance.$component.ref)
    const refComponent = pkg.components.get(refName)

    if (!refComponent) {
      errors.push({
        type: 'missing-required',
        componentName,
        propName: '',
        message: `Referenced component "${refName}" not found`,
        path,
      })
      continue
    }

    // Get props definitions from referenced component
    const refProps = refComponent.props ?? {}

    // Check required props are provided
    for (const [propName, propDef] of Object.entries(refProps)) {
      const binding = instance.propBindings?.[propName]

      // Check required
      if (
        propDef.required &&
        binding === undefined &&
        propDef.default === undefined
      ) {
        errors.push({
          type: 'missing-required',
          componentName,
          propName,
          message: `Required prop "${propName}" not provided to <${refName}>`,
          path,
        })
      }

      // Check deprecated
      if (propDef.deprecated && binding !== undefined) {
        const msg =
          typeof propDef.deprecated === 'string'
            ? propDef.deprecated
            : `Prop "${propName}" is deprecated`
        warnings.push({
          type: 'deprecated-prop',
          componentName,
          propName,
          message: msg,
        })
      }

      // Validate type if static value
      if (binding !== undefined && !isPropBinding(binding)) {
        const typeError = validatePropType(binding, propDef, propName)
        if (typeError) {
          errors.push({
            type: 'type-mismatch',
            componentName,
            propName,
            message: typeError,
            path,
          })
        }
      }

      // Validate enum values
      if (
        binding !== undefined &&
        !isPropBinding(binding) &&
        isEnumType(propDef.type)
      ) {
        if (
          typeof binding === 'string' &&
          !propDef.type.enum.includes(binding)
        ) {
          errors.push({
            type: 'invalid-enum',
            componentName,
            propName,
            message: `Invalid value "${binding}" for prop "${propName}". Expected one of: ${propDef.type.enum.join(', ')}`,
            path,
          })
        }
      }
    }

    // Check required events are provided (events are generally optional, but warn if deprecated)
    const refEvents = refComponent.events ?? {}
    for (const [eventName, eventDef] of Object.entries(refEvents)) {
      const binding = instance.eventBindings?.[eventName]

      if (eventDef.deprecated && binding !== undefined) {
        const msg =
          typeof eventDef.deprecated === 'string'
            ? eventDef.deprecated
            : `Event "${eventName}" is deprecated`
        warnings.push({
          type: 'deprecated-prop',
          componentName,
          propName: eventName,
          message: msg,
        })
      }
    }

    // Check required slots are provided
    const refSlots = refComponent.slots ?? []
    for (const slotDef of refSlots) {
      if (slotDef.required) {
        const binding = instance.slotBindings?.[slotDef.name]
        if (binding === undefined) {
          errors.push({
            type: 'missing-required',
            componentName,
            propName: slotDef.name,
            message: `Required slot "${slotDef.name}" not provided to <${refName}>`,
            path,
          })
        }
      }
    }
  }
}

function validatePropType(
  value: unknown,
  propDef: ComponentPropsDefinition[string],
  propName: string,
): string | null {
  const { type } = propDef

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
    return null
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

function isEnumType(type: unknown): type is { enum: string[] } {
  return typeof type === 'object' && type !== null && 'enum' in type
}

/**
 * Find unused props in a component (defined but never used in the tree)
 */
export function findUnusedProps(component: CoralRootNode): string[] {
  const definedProps = new Set(Object.keys(component.props ?? {}))
  const usedProps = new Set<string>()

  function collectUsedProps(node: CoralNode) {
    // Check text content
    if (
      node.textContent &&
      typeof node.textContent === 'object' &&
      isPropReference(node.textContent)
    ) {
      usedProps.add(node.textContent.$prop)
    }

    // Check element attributes
    if (node.elementAttributes) {
      for (const value of Object.values(node.elementAttributes)) {
        if (
          typeof value === 'object' &&
          value !== null &&
          isPropReference(value)
        ) {
          usedProps.add(value.$prop)
        }
      }
    }

    // Check conditional
    collectPropsFromConditional(node.conditional, usedProps)

    // Check conditional styles
    if (node.conditionalStyles) {
      for (const condStyle of node.conditionalStyles) {
        collectPropsFromConditional(condStyle.condition, usedProps)
      }
    }

    // Recurse
    if (node.children) {
      for (const child of node.children) {
        collectUsedProps(child)
      }
    }
    if (node.slotFallback) {
      for (const fallback of node.slotFallback) {
        collectUsedProps(fallback)
      }
    }
  }

  collectUsedProps(component)

  return Array.from(definedProps).filter((prop) => !usedProps.has(prop))
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

function collectPropsFromConditional(expr: unknown, usedProps: Set<string>) {
  if (!isConditionalExpression(expr)) return

  if ('$prop' in expr) {
    usedProps.add(expr.$prop)
  }

  if ('$not' in expr) {
    collectPropsFromConditional(expr.$not, usedProps)
  }

  if ('$and' in expr) {
    for (const item of expr.$and) {
      collectPropsFromConditional(item, usedProps)
    }
  }

  if ('$or' in expr) {
    for (const item of expr.$or) {
      collectPropsFromConditional(item, usedProps)
    }
  }

  if ('$eq' in expr) {
    const [left] = expr.$eq
    collectPropsFromConditional(left, usedProps)
  }

  if ('$ne' in expr) {
    const [left] = expr.$ne
    collectPropsFromConditional(left, usedProps)
  }
}
