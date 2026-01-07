---
title: "Types & Guards"
description: Type definitions and type guard functions.
---

# Types & Guards

Type definitions and utility functions for working with Coral specifications.

## Type Safety

Coral Core is fully type-safe with zero `any` types and no type assertions:

- **All `any` types removed** - Replaced with `unknown` and proper type guards
- **No `as` assertions** - Type guards provide safe type narrowing
- **Recursive types** - `CoralStyleType` is an interface supporting nested styles
- **Nullable types** - `CoralTSTypes` is `z.nullable` - returns `null` when type cannot be determined

## Type Guards

Type guards provide safe type narrowing without type assertions:

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

// Example usage - TypeScript automatically narrows types
if (isTokenReference(value)) {
  // value.$token is available - TypeScript knows this is TokenReference
  console.log(`Token path: ${value.$token}`)
}

if (isComponentInstance(node)) {
  // node.$component is available - TypeScript knows this is ComponentInstance
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

## Core Type Definitions

### CoralTSTypes

```typescript
// CoralTSTypes is nullable - can be null when type cannot be determined
type CoralTSTypes =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | 'undefined'
  | 'function'
  | null  // Returned when type cannot be determined

// Defined as z.nullable in the schema
export const zCoralTSTypes = z.nullable(
  z.union([
    z.literal('string'),
    z.literal('number'),
    z.literal('boolean'),
    z.literal('array'),
    z.literal('object'),
    z.literal('null'),
    z.literal('undefined'),
    z.literal('function'),
  ])
)
```

### CoralStyleType

```typescript
// CoralStyleType is an interface (not type alias) to support recursive references
interface CoralStyleType {
  [key: string]:
    | string
    | number
    | CoralColorType
    | CoralGradientType
    | Dimension
    | CoralStyleType  // Recursive for nested styles (e.g., responsive breakpoints)
}

// Schema uses z.lazy() for recursive validation
export const zCoralStyleSchema: z.ZodType<CoralStyleType> = z.lazy(() =>
  z.record(
    z.string(),
    z.union([
      zCoralStyleValueSchema,
      z.record(z.string(), z.union([zCoralStyleValueSchema, zCoralStyleSchema]))
    ])
  )
)
```

### Type Safety Best Practices

1. **Use type guards instead of assertions**:
   ```typescript
   // ❌ Bad - type assertion
   const value = node.textContent as PropReference

   // ✅ Good - type guard
   if (isPropReference(node.textContent)) {
     // TypeScript knows node.textContent is PropReference here
     console.log(node.textContent.$prop)
   }
   ```

2. **Handle nullable types properly**:
   ```typescript
   // CoralTSTypes can be null
   const propType: CoralTSTypes = getTypeFromAnnotation(annotation)
   if (propType === null) {
     // Handle unknown type
   } else {
     // propType is one of the literal types
   }
   ```

3. **Use `unknown` with type guards**:
   ```typescript
   // ❌ Bad - any bypasses type checking
   function process(value: any) { ... }

   // ✅ Good - unknown requires type narrowing
   function process(value: unknown) {
     if (isTokenReference(value)) {
       // TypeScript knows value is TokenReference
     }
   }
   ```

## Related

- [Variants](/docs/packages/core/variants) - Variant system
- [Props & Events](/docs/packages/core/props-events) - Typed APIs
- [References](/docs/packages/core/references) - Reference types
