import * as z from 'zod'

/**
 * Token source file entry
 *
 * @example
 * ```json
 * {
 *   "path": "./primitives.tokens.json",
 *   "layer": "primitive"
 * }
 * ```
 */
export const zTokenSourceSchema = z
  .object({
    /** Path to token file */
    path: z.string().describe('Path to token file'),

    /** Token layer (for ordering/cascading) */
    layer: z
      .enum(['primitive', 'semantic', 'component'])
      .optional()
      .describe('Token layer'),
  })
  .describe('Token source entry')

export type TokenSource = z.infer<typeof zTokenSourceSchema>

/**
 * Context dimension (e.g., colorScheme: light/dark)
 *
 * @example
 * ```json
 * {
 *   "name": "colorScheme",
 *   "values": ["light", "dark"]
 * }
 * ```
 */
export const zContextDimensionSchema = z
  .object({
    name: z.string().describe('Dimension name'),
    values: z.array(z.string()).describe('Possible values'),
  })
  .describe('Context dimension')

export type ContextDimension = z.infer<typeof zContextDimensionSchema>

/**
 * Context definition
 */
export const zContextDefinitionSchema = z
  .object({
    name: z.string().describe('Context name'),
    description: z.string().optional().describe('Context description'),
    default: z.boolean().optional().describe('Is default context'),
    mediaQuery: z.string().optional().describe('Auto-activate media query'),
  })
  .describe('Context definition')

export type ContextDefinition = z.infer<typeof zContextDefinitionSchema>

/**
 * Token index file: tokens/index.json
 *
 * @example
 * ```json
 * {
 *   "$schema": "https://coral.design/tokens-index.schema.json",
 *   "name": "ACME Tokens",
 *   "version": "1.0.0",
 *   "sources": [
 *     { "path": "./primitives.tokens.json", "layer": "primitive" },
 *     { "path": "./semantic.tokens.json", "layer": "semantic" }
 *   ],
 *   "contexts": {
 *     "definitions": [
 *       { "name": "light", "default": true },
 *       { "name": "dark", "mediaQuery": "(prefers-color-scheme: dark)" }
 *     ],
 *     "dimensions": [
 *       { "name": "colorScheme", "values": ["light", "dark"] }
 *     ]
 *   }
 * }
 * ```
 */
export const zTokenIndexSchema = z
  .object({
    $schema: z.string().optional().describe('JSON schema reference'),

    name: z.string().describe('Index name'),
    version: z.string().describe('Index version'),

    /** Token source files */
    sources: z.array(zTokenSourceSchema).describe('Token source files'),

    /** Context configuration */
    contexts: z
      .object({
        definitions: z
          .array(zContextDefinitionSchema)
          .describe('Context definitions'),
        dimensions: z
          .array(zContextDimensionSchema)
          .optional()
          .describe('Context dimensions'),
      })
      .optional()
      .describe('Context configuration'),
  })
  .describe('Token index')

export type TokenIndex = z.infer<typeof zTokenIndexSchema>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create an empty token index
 */
export function createTokenIndex(name: string, version: string): TokenIndex {
  return {
    $schema: 'https://coral.design/tokens-index.schema.json',
    name,
    version,
    sources: [],
  }
}

/**
 * Add a token source to the index
 */
export function addTokenSource(
  index: TokenIndex,
  source: TokenSource,
): TokenIndex {
  return {
    ...index,
    sources: [...index.sources, source],
  }
}

/**
 * Get token sources by layer
 */
export function getSourcesByLayer(
  index: TokenIndex,
  layer: TokenSource['layer'],
): TokenSource[] {
  return index.sources.filter((s) => s.layer === layer)
}

/**
 * Get ordered sources (primitives first, then semantic, then component)
 */
export function getOrderedSources(index: TokenIndex): TokenSource[] {
  const layerOrder: TokenSource['layer'][] = [
    'primitive',
    'semantic',
    'component',
  ]
  const withLayer = index.sources.filter((s) => s.layer)
  const withoutLayer = index.sources.filter((s) => !s.layer)

  const ordered = layerOrder.flatMap((layer) =>
    withLayer.filter((s) => s.layer === layer),
  )

  return [...ordered, ...withoutLayer]
}

/**
 * Get default context from index
 */
export function getDefaultContext(index: TokenIndex): string | undefined {
  const defaultDef = index.contexts?.definitions.find((d) => d.default)
  return defaultDef?.name ?? index.contexts?.definitions[0]?.name
}

/**
 * Get all context names
 */
export function getContextNames(index: TokenIndex): string[] {
  return index.contexts?.definitions.map((d) => d.name) ?? []
}

/**
 * Find context definition by name
 */
export function findContextDefinition(
  index: TokenIndex,
  name: string,
): ContextDefinition | undefined {
  return index.contexts?.definitions.find((d) => d.name === name)
}

/**
 * Create default token index with light/dark contexts
 */
export function createDefaultTokenIndex(
  name: string,
  version: string,
): TokenIndex {
  return {
    $schema: 'https://coral.design/tokens-index.schema.json',
    name,
    version,
    sources: [
      { path: './primitives.tokens.json', layer: 'primitive' },
      { path: './semantic.tokens.json', layer: 'semantic' },
    ],
    contexts: {
      definitions: [
        { name: 'light', default: true },
        { name: 'dark', mediaQuery: '(prefers-color-scheme: dark)' },
      ],
      dimensions: [{ name: 'colorScheme', values: ['light', 'dark'] }],
    },
  }
}
