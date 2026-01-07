import {
  isAssetReference,
  isPropReference,
  isTokenReference,
} from '../structures/references'
import type { TokenReference, PropReference } from '../structures/references'
import type { LoadedPackage } from './packageLoader'

/**
 * Reference resolver interface
 */
export interface ReferenceResolver {
  /** Resolve a token reference to its value */
  resolveToken(ref: TokenReference, context?: string): unknown

  /** Resolve a prop reference to its value */
  resolveProp(ref: PropReference, props: Record<string, unknown>): unknown

  /** Resolve an asset reference to its path */
  resolveAsset(ref: { $asset: string }): string
}

/**
 * Options for creating a reference resolver
 */
export interface ReferenceResolverOptions {
  /** Token context (e.g., "light" or "dark") */
  tokenContext?: string
}

/**
 * Create a reference resolver for a loaded package
 *
 * @param pkg - Loaded package
 * @param options - Resolver options
 * @returns Reference resolver
 *
 * @example
 * ```ts
 * const pkg = await loadPackage('./design-system/coral.config.json', options)
 * const resolver = createReferenceResolver(pkg, { tokenContext: 'dark' })
 *
 * const color = resolver.resolveToken({ $token: 'color.primary.500' })
 * const label = resolver.resolveProp({ $prop: 'label' }, { label: 'Click me' })
 * ```
 */
export function createReferenceResolver(
  pkg: LoadedPackage,
  options?: ReferenceResolverOptions,
): ReferenceResolver {
  const { tokenContext = 'light' } = options ?? {}

  // Build flattened token map
  const flatTokens = flattenTokens(pkg.tokens, tokenContext)

  return {
    resolveToken(ref: TokenReference, context = tokenContext): unknown {
      // If different context requested, re-flatten
      const tokens = context === tokenContext ? flatTokens : flattenTokens(pkg.tokens, context)

      const value = tokens.get(ref.$token)
      if (value === undefined) {
        if (ref.$fallback !== undefined) {
          return ref.$fallback
        }
        console.warn(`Token not found: ${ref.$token}`)
        return undefined
      }
      return value
    },

    resolveProp(ref: PropReference, props: Record<string, unknown>): unknown {
      return props[ref.$prop]
    },

    resolveAsset(ref: { $asset: string }): string {
      return `${pkg.basePath}/assets/${ref.$asset}`
    },
  }
}

/**
 * Flatten nested token structure into dot-notation paths
 */
function flattenTokens(
  tokens: Map<string, unknown>,
  context: string,
): Map<string, unknown> {
  const result = new Map<string, unknown>()

  for (const [, tokenData] of tokens) {
    flattenObject(tokenData as Record<string, unknown>, '', result, context)
  }

  // Second pass: resolve internal references
  for (const [path, value] of result) {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      const refPath = value.slice(1, -1)
      const resolved = result.get(refPath)
      if (resolved !== undefined) {
        result.set(path, resolved)
      }
    }
  }

  return result
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix: string,
  result: Map<string, unknown>,
  context: string,
) {
  for (const [key, value] of Object.entries(obj)) {
    // Skip meta keys
    if (key.startsWith('$')) continue

    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null) {
      // Check if it's a token definition
      if ('$value' in value) {
        const tokenValue = value as { $value: unknown }
        let resolved = tokenValue.$value

        // Handle contextual values
        if (typeof resolved === 'object' && resolved !== null && '$contexts' in resolved) {
          const contextual = resolved as {
            $contexts: Record<string, unknown>
            $default?: string
          }
          resolved =
            contextual.$contexts[context] ?? contextual.$contexts[contextual.$default ?? 'light']
        }

        result.set(path, resolved)
      } else {
        // Recurse into nested object
        flattenObject(value as Record<string, unknown>, path, result, context)
      }
    }
  }
}

/**
 * Resolve all references in a style object
 *
 * @param styles - Style object potentially containing references
 * @param resolver - Reference resolver
 * @param props - Current prop values
 * @returns Style object with all references resolved
 */
export function resolveStyleReferences(
  styles: Record<string, unknown>,
  resolver: ReferenceResolver,
  props: Record<string, unknown>,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(styles)) {
    resolved[key] = resolveValue(value, resolver, props)
  }

  return resolved
}

/**
 * Resolve a single value that might be a reference
 */
export function resolveValue(
  value: unknown,
  resolver: ReferenceResolver,
  props: Record<string, unknown>,
): unknown {
  if (isTokenReference(value)) {
    return resolver.resolveToken(value)
  }

  if (isPropReference(value)) {
    return resolver.resolveProp(value, props)
  }

  if (isAssetReference(value)) {
    return resolver.resolveAsset(value)
  }

  // Recurse into objects
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return resolveStyleReferences(value as Record<string, unknown>, resolver, props)
  }

  // Arrays
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, resolver, props))
  }

  return value
}

/**
 * Get all token paths used in a style object
 */
export function collectTokenReferences(
  styles: Record<string, unknown>,
): string[] {
  const tokens: string[] = []

  function collect(value: unknown) {
    if (isTokenReference(value)) {
      tokens.push(value.$token)
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        for (const item of value) {
          collect(item)
        }
      } else {
        for (const v of Object.values(value)) {
          collect(v)
        }
      }
    }
  }

  collect(styles)
  return tokens
}

/**
 * Get all prop references in a style object
 */
export function collectPropReferences(
  styles: Record<string, unknown>,
): string[] {
  const props: string[] = []

  function collect(value: unknown) {
    if (isPropReference(value)) {
      props.push(value.$prop)
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        for (const item of value) {
          collect(item)
        }
      } else {
        for (const v of Object.values(value)) {
          collect(v)
        }
      }
    }
  }

  collect(styles)
  return props
}
