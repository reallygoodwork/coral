---
title: "Types & Guards"
description: Type definitions and type guard functions.
---

# Types & Guards

Type definitions and utility functions for working with Coral specifications.

## Type Guards

```typescript
import {
  // Reference type guards
  isTokenReference,
  isPropReference,
  isComponentReference,
  isAssetReference,
  isExternalReference,
  isAnyReference,

  // Conditional type guards
  isConditionalExpression,

  // Binding type guards
  isPropTransform,
  isEventReference,
  isComputedValue,
  isInlineHandler,

  // Composition type guards
  isComponentInstance,
  isPropBinding,
  isSlotForward,
} from '@reallygoodwork/coral-core'

// Example usage
if (isTokenReference(value)) {
  console.log(`Token path: ${value.$token}`)
}

if (isComponentInstance(node)) {
  console.log(`Component ref: ${node.$component.ref}`)
}
```

---

## Extended CoralNode Fields

```typescript
type CoralNode = {
  // ... existing fields ...

  // Variant styles
  variantStyles?: NodeVariantStyles
  compoundVariantStyles?: CompoundVariantStyle[]
  stateStyles?: StateStyles

  // Conditional rendering
  conditional?: ConditionalExpression
  conditionalBehavior?: 'hide' | 'dim' | 'outline'
  conditionalStyles?: ConditionalStyle[]

  // Slots
  slotTarget?: string
  slotFallback?: CoralNode[]

  // Component instances (when type === 'COMPONENT_INSTANCE')
  $component?: ComponentInstanceRef
  propBindings?: Record<string, PropBinding>
  eventBindings?: Record<string, EventBinding>
  slotBindings?: Record<string, SlotBinding>
  variantOverrides?: Record<string, string>
  styleOverrides?: CoralStyleType

  // Element bindings
  eventHandlers?: Record<string, EventBinding>
  ariaAttributes?: Record<string, BindableValue>
  dataAttributes?: Record<string, BindableValue>
}
```

---

## Extended CoralRootNode Fields

```typescript
type CoralRootNode = CoralNode & {
  // ... existing fields ...

  // Enhanced metadata
  $meta?: ComponentMeta

  // Component-level variants
  componentVariants?: ComponentVariants

  // Typed props (extends componentProperties)
  props?: ComponentPropsDefinition

  // Typed events (extends methods)
  events?: ComponentEventsDefinition

  // Slot definitions
  slots?: SlotDefinition[]
}
```

---

## Reference Types

```typescript
type TokenReference = {
  $token: string
  $fallback?: unknown
}

type PropReference = {
  $prop: string
}

type ComponentReference = {
  $component: {
    ref: string
    version?: string
  }
}

type AssetReference = {
  $asset: string
  $fallback?: string
}

type ExternalReference = {
  $external: string
}
```

---

## Variant Types

```typescript
type VariantAxis = {
  name: string
  values: string[]
  default: string
  description?: string
}

type ComponentVariants = {
  axes: VariantAxis[]
  compounds?: CompoundVariantCondition[]
}

type CompoundVariantCondition = {
  conditions: Record<string, string>
  description?: string
}

type NodeVariantStyles = Record<string, Record<string, CoralStyleType>>

type CompoundVariantStyle = {
  conditions: Record<string, string>
  styles: CoralStyleType
}

type StateStyles = Record<string, CoralStyleType | NodeVariantStyles>
```

---

## Prop Types

```typescript
type PrimitivePropType = 'string' | 'number' | 'boolean' | 'ReactNode'

type PropType =
  | PrimitivePropType
  | { enum: string[] }
  | { array: PropType }
  | { object: Record<string, PropType> }
  | { union: PropType[] }

type ComponentPropDefinition = {
  type: PropType
  default?: unknown
  required?: boolean
  description?: string
  editorControl?: EditorControl
  constraints?: PropConstraints
}

type ComponentPropsDefinition = Record<string, ComponentPropDefinition>
```

---

## Event Types

```typescript
type EventParameter = {
  name: string
  type: string
  optional?: boolean
}

type ComponentEventDefinition = {
  description?: string
  parameters?: EventParameter[]
  deprecated?: boolean | string
}

type ComponentEventsDefinition = Record<string, ComponentEventDefinition>
```

---

## Conditional Types

```typescript
type ConditionalExpression =
  | { $prop: string }
  | { $not: ConditionalExpression }
  | { $and: ConditionalExpression[] }
  | { $or: ConditionalExpression[] }
  | { $eq: [ConditionalExpression, unknown] }
  | { $ne: [ConditionalExpression, unknown] }

type ConditionalBehavior = 'hide' | 'dim' | 'outline'

type ConditionalStyle = {
  condition: ConditionalExpression
  styles: CoralStyleType
}
```

---

## Slot Types

```typescript
type SlotDefinition = {
  name: string
  description?: string
  required?: boolean
  multiple?: boolean
  allowedElements?: string[]
  allowedComponents?: string[]
  defaultContent?: CoralNode[]
}

type SlotBinding =
  | CoralNode
  | CoralNode[]
  | { $prop: string }
  | { $slot: string }
```

---

## Binding Types

```typescript
type PropTransform = {
  $prop: string
  $transform: 'boolean' | 'not' | 'string' | 'number'
}

type ComputedValue = {
  $computed: 'concat' | 'ternary'
  $inputs: unknown[]
}

type EventReference = {
  $event: string
  $params?: unknown[]
}

type InlineHandler = {
  $inline: string
}

type EventBinding = EventReference | InlineHandler

type BindableValue =
  | string
  | number
  | boolean
  | { $prop: string }
  | PropTransform
  | ComputedValue
  | { $token: string }
```

---

## Package Types

```typescript
type CoralConfig = {
  $schema?: string
  name: string
  version: string
  description?: string
  coral: CoralSpec
  tokens?: TokensConfig
  components?: ComponentsConfig
  assets?: AssetsConfig
  presets?: PresetsConfig
  extends?: string[]
  exports?: Record<string, ExportTarget>
}

type LoadedPackage = {
  config: CoralConfig
  configPath: string
  components: Map<string, CoralRootNode>
  tokens: Map<string, Record<string, unknown>>
  componentIndex?: ComponentIndex
  tokenIndex?: TokenIndex
}
```

---

## Related

- [Variants](/docs/packages/core/variants) - Variant system
- [Props & Events](/docs/packages/core/props-events) - Typed APIs
- [References](/docs/packages/core/references) - Reference types
