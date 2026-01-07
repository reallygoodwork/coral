import type { EventBinding } from '../structures/bindings'
import {
  applyTransform,
  extractValue,
  isComputedValue,
  isEventReference,
  isInlineHandler,
  isPropReference,
  isPropTransform,
  resolveComputed,
} from '../structures/bindings'

/**
 * Resolve a prop binding to its actual value
 *
 * @param binding - The binding to resolve
 * @param parentProps - Parent component's prop values
 * @returns Resolved value
 *
 * @example
 * ```ts
 * // Static value
 * resolvePropBinding('primary', {}) // 'primary'
 *
 * // Prop reference
 * resolvePropBinding({ $prop: 'intent' }, { intent: 'secondary' }) // 'secondary'
 *
 * // Prop transform
 * resolvePropBinding({ $prop: 'disabled', $transform: 'not' }, { disabled: false }) // true
 *
 * // Computed value
 * resolvePropBinding(
 *   { $computed: 'concat', $inputs: [{ $prop: 'firstName' }, ' ', { $prop: 'lastName' }] },
 *   { firstName: 'John', lastName: 'Doe' }
 * ) // 'John Doe'
 * ```
 */
export function resolvePropBinding(
  binding: unknown,
  parentProps: Record<string, unknown>,
): unknown {
  // Static value
  if (!isReference(binding)) {
    return binding
  }

  // Simple prop reference
  if (isPropReference(binding)) {
    return parentProps[binding.$prop]
  }

  // Transformed prop
  if (isPropTransform(binding)) {
    const value = parentProps[binding.$prop]
    return applyTransform(value, binding.$transform)
  }

  // Computed value
  if (isComputedValue(binding)) {
    return resolveComputed(binding, (input) => {
      if (isPropReference(input)) {
        return parentProps[input.$prop]
      }
      if (isPropTransform(input)) {
        const value = parentProps[input.$prop]
        return applyTransform(value, input.$transform)
      }
      return input
    })
  }

  return binding
}

/**
 * Resolve an event binding to a handler function
 *
 * @param binding - The event binding to resolve
 * @param parentEvents - Parent component's event handlers
 * @param parentProps - Parent component's prop values
 * @param setParentProp - Function to update a parent prop
 * @returns Resolved handler function or undefined
 *
 * @example
 * ```ts
 * // Forward to parent event
 * const handler = resolveEventBinding(
 *   { $event: 'onClick' },
 *   { onClick: (e) => console.log('clicked', e) },
 *   {},
 *   () => {}
 * )
 *
 * // With extraction
 * const handler = resolveEventBinding(
 *   { $event: 'onChange', $extract: 'target.value' },
 *   { onChange: (value) => console.log('value:', value) },
 *   {},
 *   () => {}
 * )
 *
 * // Inline toggle handler
 * const handler = resolveEventBinding(
 *   { $handler: 'toggle', $target: 'isOpen' },
 *   {},
 *   { isOpen: false },
 *   (prop, value) => { ... }
 * )
 * ```
 */
export function resolveEventBinding(
  binding: EventBinding,
  parentEvents: Record<string, (...args: unknown[]) => void>,
  parentProps: Record<string, unknown>,
  setParentProp: (name: string, value: unknown) => void,
): ((...args: unknown[]) => void) | undefined {
  // Forward to parent event
  if (isEventReference(binding)) {
    const handler = parentEvents[binding.$event]
    if (!handler) return undefined

    return (...args: unknown[]) => {
      let finalArgs = args

      // Extract specific value from event
      if (binding.$extract && args[0]) {
        const extracted = extractValue(args[0], binding.$extract)
        finalArgs = [extracted, ...args.slice(1)]
      }

      // Add additional args
      if (binding.$args) {
        finalArgs = [...finalArgs, ...binding.$args]
      }

      handler(...finalArgs)
    }
  }

  // Inline handler
  if (isInlineHandler(binding)) {
    switch (binding.$handler) {
      case 'preventDefault':
        return (event: unknown) => {
          if (
            event &&
            typeof event === 'object' &&
            'preventDefault' in event &&
            typeof (event as { preventDefault: unknown }).preventDefault ===
              'function'
          ) {
            ;(event as { preventDefault: () => void }).preventDefault()
          }
        }

      case 'stopPropagation':
        return (event: unknown) => {
          if (
            event &&
            typeof event === 'object' &&
            'stopPropagation' in event &&
            typeof (event as { stopPropagation: unknown }).stopPropagation ===
              'function'
          ) {
            ;(event as { stopPropagation: () => void }).stopPropagation()
          }
        }

      case 'toggle':
        return () => {
          if (binding.$target) {
            const current = parentProps[binding.$target]
            setParentProp(binding.$target, !current)
          }
        }

      case 'set':
        return () => {
          if (binding.$target) {
            setParentProp(binding.$target, binding.$value)
          }
        }
    }
  }

  return undefined
}

/**
 * Resolve all prop bindings for a component instance
 *
 * @param bindings - Map of prop names to bindings
 * @param parentProps - Parent prop values
 * @returns Resolved prop values
 */
export function resolveAllPropBindings(
  bindings: Record<string, unknown> | undefined,
  parentProps: Record<string, unknown>,
): Record<string, unknown> {
  if (!bindings) return {}

  const resolved: Record<string, unknown> = {}

  for (const [name, binding] of Object.entries(bindings)) {
    resolved[name] = resolvePropBinding(binding, parentProps)
  }

  return resolved
}

/**
 * Resolve all event bindings for a component instance
 *
 * @param bindings - Map of event names to bindings
 * @param parentEvents - Parent event handlers
 * @param parentProps - Parent prop values
 * @param setParentProp - Function to update parent props
 * @returns Resolved event handlers
 */
export function resolveAllEventBindings(
  bindings: Record<string, EventBinding> | undefined,
  parentEvents: Record<string, (...args: unknown[]) => void>,
  parentProps: Record<string, unknown>,
  setParentProp: (name: string, value: unknown) => void,
): Record<string, (...args: unknown[]) => void> {
  if (!bindings) return {}

  const resolved: Record<string, (...args: unknown[]) => void> = {}

  for (const [name, binding] of Object.entries(bindings)) {
    const handler = resolveEventBinding(
      binding,
      parentEvents,
      parentProps,
      setParentProp,
    )
    if (handler) {
      resolved[name] = handler
    }
  }

  return resolved
}

/**
 * Check if a value is any type of reference
 */
function isReference(value: unknown): boolean {
  return (
    isPropReference(value) ||
    isPropTransform(value) ||
    isComputedValue(value) ||
    isEventReference(value)
  )
}

/**
 * Collect all prop names referenced in bindings
 */
export function collectReferencedProps(
  bindings: Record<string, unknown>,
): string[] {
  const props = new Set<string>()

  function collect(value: unknown) {
    if (isPropReference(value)) {
      props.add(value.$prop)
    } else if (isPropTransform(value)) {
      props.add(value.$prop)
    } else if (isComputedValue(value)) {
      for (const input of value.$inputs) {
        collect(input)
      }
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      for (const v of Object.values(value)) {
        collect(v)
      }
    }
  }

  for (const binding of Object.values(bindings)) {
    collect(binding)
  }

  return Array.from(props)
}

/**
 * Collect all event names referenced in bindings
 */
export function collectReferencedEvents(
  bindings: Record<string, EventBinding>,
): string[] {
  const events = new Set<string>()

  for (const binding of Object.values(bindings)) {
    if (isEventReference(binding)) {
      events.add(binding.$event)
    }
  }

  return Array.from(events)
}
