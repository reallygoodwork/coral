import * as z from 'zod'

/**
 * Reference to a design token
 * Used to bind style values to tokens defined in the token system
 */
export const zTokenReferenceSchema = z
  .object({
    $token: z.string().describe('The token path (e.g., "color.primary.500")'),
    $fallback: z.unknown().optional().describe('Fallback value if token not found'),
  })
  .describe('A reference to a design token')

export type TokenReference = z.infer<typeof zTokenReferenceSchema>

/**
 * Reference to a component prop
 * Used to bind element attributes or content to component props
 */
export const zPropReferenceSchema = z
  .object({
    $prop: z.string().describe('The prop name to reference'),
  })
  .describe('A reference to a component prop')

export type PropReference = z.infer<typeof zPropReferenceSchema>

/**
 * Reference to another component (for composition)
 * Used when a node renders another Coral component
 */
export const zComponentReferenceSchema = z
  .object({
    $component: z.object({
      ref: z.string().describe('Path to component file'),
      version: z.string().optional().describe('Semver constraint'),
    }),
    propBindings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Props to pass to the component'),
    slotBindings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Slot content to pass to the component'),
  })
  .describe('A reference to another Coral component')

export type ComponentReference = z.infer<typeof zComponentReferenceSchema>

/**
 * Reference to an asset (image, icon, etc.)
 */
export const zAssetReferenceSchema = z
  .object({
    $asset: z.string().describe('Path to asset file'),
  })
  .describe('A reference to an asset file')

export type AssetReference = z.infer<typeof zAssetReferenceSchema>

/**
 * Reference to an external package export
 * Used for importing components/utilities from external packages
 */
export const zExternalReferenceSchema = z
  .object({
    $external: z.object({
      package: z.string().describe('Package name (npm-style)'),
      path: z.string().describe('Export path within package'),
    }),
  })
  .describe('A reference to an external package export')

export type ExternalReference = z.infer<typeof zExternalReferenceSchema>

/**
 * Union of all reference types for use in schemas
 */
export const zAnyReferenceSchema = z.union([
  zTokenReferenceSchema,
  zPropReferenceSchema,
  zComponentReferenceSchema,
  zAssetReferenceSchema,
  zExternalReferenceSchema,
])

export type AnyReference = z.infer<typeof zAnyReferenceSchema>

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a token reference
 */
export function isTokenReference(value: unknown): value is TokenReference {
  return typeof value === 'object' && value !== null && '$token' in value
}

/**
 * Check if a value is a prop reference
 */
export function isPropReference(value: unknown): value is PropReference {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$prop' in value &&
    !('$transform' in value)
  )
}

/**
 * Check if a value is a component reference
 */
export function isComponentReference(value: unknown): value is ComponentReference {
  return typeof value === 'object' && value !== null && '$component' in value
}

/**
 * Check if a value is an asset reference
 */
export function isAssetReference(value: unknown): value is AssetReference {
  return typeof value === 'object' && value !== null && '$asset' in value
}

/**
 * Check if a value is an external reference
 */
export function isExternalReference(value: unknown): value is ExternalReference {
  return typeof value === 'object' && value !== null && '$external' in value
}

/**
 * Check if a value is any type of reference
 */
export function isAnyReference(value: unknown): value is AnyReference {
  return (
    isTokenReference(value) ||
    isPropReference(value) ||
    isComponentReference(value) ||
    isAssetReference(value) ||
    isExternalReference(value)
  )
}
