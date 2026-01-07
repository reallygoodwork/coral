import * as z from 'zod'

/**
 * Token context definition (e.g., light/dark modes)
 *
 * @example
 * ```json
 * {
 *   "name": "dark",
 *   "description": "Dark color scheme",
 *   "default": false,
 *   "mediaQuery": "(prefers-color-scheme: dark)"
 * }
 * ```
 */
export const zTokenContextSchema = z
  .object({
    name: z.string().describe('Context name (e.g., "light", "dark")'),
    description: z.string().optional().describe('Context description'),
    default: z.boolean().optional().describe('Whether this is the default context'),
    mediaQuery: z.string().optional().describe('CSS media query to auto-activate'),
  })
  .describe('Token context definition')

export type TokenContext = z.infer<typeof zTokenContextSchema>

/**
 * Tokens configuration
 */
export const zTokensConfigSchema = z
  .object({
    /** Entry point for tokens (index file) */
    entry: z.string().describe('Path to token index file'),

    /** Available contexts */
    contexts: z
      .array(zTokenContextSchema)
      .optional()
      .describe('Available token contexts'),
  })
  .describe('Tokens configuration')

export type TokensConfig = z.infer<typeof zTokensConfigSchema>

/**
 * Components configuration
 */
export const zComponentsConfigSchema = z
  .object({
    /** Entry point (index file) */
    entry: z.string().describe('Path to component index file'),
  })
  .describe('Components configuration')

export type ComponentsConfig = z.infer<typeof zComponentsConfigSchema>

/**
 * Assets configuration
 */
export const zAssetsConfigSchema = z
  .object({
    /** Entry point for assets */
    entry: z.string().describe('Path to assets directory'),
  })
  .optional()
  .describe('Assets configuration')

export type AssetsConfig = z.infer<typeof zAssetsConfigSchema>

/**
 * Presets configuration (CSS reset, global styles)
 */
export const zPresetsConfigSchema = z
  .object({
    cssReset: z.string().optional().describe('Path to CSS reset file'),
    globalStyles: z.string().optional().describe('Path to global styles file'),
  })
  .describe('Presets configuration')

export type PresetsConfig = z.infer<typeof zPresetsConfigSchema>

/**
 * Export target configuration
 * Defines how to generate output for a specific target.
 *
 * @example
 * ```json
 * {
 *   "outDir": "./dist/react",
 *   "typescript": true,
 *   "styling": "tailwind",
 *   "componentFormat": "function"
 * }
 * ```
 */
export const zExportTargetSchema = z
  .object({
    outDir: z.string().describe('Output directory'),

    typescript: z.boolean().optional().describe('Generate TypeScript'),

    styling: z
      .enum([
        'inline',
        'css-modules',
        'tailwind',
        'styled-components',
        'css-variables',
      ])
      .optional()
      .describe('Styling strategy'),

    fileCase: z
      .enum(['PascalCase', 'kebab-case', 'camelCase'])
      .optional()
      .describe('File naming convention'),

    componentFormat: z
      .enum(['function', 'arrow'])
      .optional()
      .describe('Component declaration style'),
  })
  .describe('Export target configuration')

export type ExportTarget = z.infer<typeof zExportTargetSchema>

/**
 * Coral specification version info
 */
export const zCoralSpecSchema = z
  .object({
    specVersion: z.string().describe('Coral spec version this package targets'),
  })
  .describe('Coral specification version')

export type CoralSpec = z.infer<typeof zCoralSpecSchema>

/**
 * Main package manifest: coral.config.json
 *
 * A Coral package is a self-contained design system that can be
 * copied, shared, and consumed by any tool.
 *
 * @example
 * ```json
 * {
 *   "$schema": "https://coral.design/config.schema.json",
 *   "name": "@acme/design-system",
 *   "version": "1.0.0",
 *   "description": "ACME Design System",
 *   "coral": { "specVersion": "1.0.0" },
 *   "tokens": { "entry": "./tokens/index.json" },
 *   "components": { "entry": "./components/index.json" },
 *   "exports": {
 *     "react": {
 *       "outDir": "./dist/react",
 *       "typescript": true,
 *       "styling": "tailwind"
 *     }
 *   }
 * }
 * ```
 */
export const zCoralConfigSchema = z
  .object({
    /** JSON schema reference */
    $schema: z.string().optional().describe('JSON schema reference'),

    /** Package name (npm-style) */
    name: z
      .string()
      .regex(/^(@[a-z0-9-]+\/)?[a-z0-9-]+$/, 'Must be valid package name')
      .describe('Package name (npm-style)'),

    /** Package version (semver) */
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+/, 'Must be semver')
      .describe('Package version (semver)'),

    /** Package description */
    description: z.string().optional().describe('Package description'),

    /** Coral spec version */
    coral: zCoralSpecSchema.describe('Coral specification version'),

    /** Tokens configuration */
    tokens: zTokensConfigSchema.optional().describe('Tokens configuration'),

    /** Components configuration */
    components: zComponentsConfigSchema.optional().describe('Components configuration'),

    /** Assets configuration */
    assets: zAssetsConfigSchema.describe('Assets configuration'),

    /** Presets (CSS reset, global styles) */
    presets: zPresetsConfigSchema.optional().describe('Presets configuration'),

    /** Extended packages */
    extends: z
      .array(z.string())
      .optional()
      .describe('Packages to extend (npm-style references)'),

    /** Export configurations */
    exports: z
      .record(z.string(), zExportTargetSchema)
      .optional()
      .describe('Export target configurations'),
  })
  .describe('Coral package manifest')

export type CoralConfig = z.infer<typeof zCoralConfigSchema>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse a package reference string (e.g., "@acme/tokens@^1.0.0")
 *
 * @returns [packageName, version | undefined]
 */
export function parsePackageRef(ref: string): [string, string | undefined] {
  // Handle scoped packages like @acme/tokens@^1.0.0
  const atIndex = ref.lastIndexOf('@')

  // If the only @ is at the start (scoped package), no version
  if (atIndex <= 0) {
    return [ref, undefined]
  }

  // Check if the @ is actually a version separator
  const beforeAt = ref.slice(0, atIndex)
  if (beforeAt.includes('/') || !beforeAt.startsWith('@')) {
    return [beforeAt, ref.slice(atIndex + 1)]
  }

  return [ref, undefined]
}

/**
 * Create a default coral.config.json structure
 */
export function createDefaultConfig(name: string, version = '0.1.0'): CoralConfig {
  return {
    $schema: 'https://coral.design/config.schema.json',
    name,
    version,
    coral: {
      specVersion: '1.0.0',
    },
    tokens: {
      entry: './tokens/index.json',
    },
    components: {
      entry: './components/index.json',
    },
  }
}

/**
 * Validate a coral.config.json object
 */
export function validateConfig(config: unknown): {
  success: boolean
  data?: CoralConfig
  errors?: string[]
} {
  const result = zCoralConfigSchema.safeParse(config)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    errors: result.error.issues.map((e) => `${String(e.path.join('.'))}: ${e.message}`),
  }
}

/**
 * Get the default export target from config
 */
export function getDefaultExportTarget(config: CoralConfig): ExportTarget | undefined {
  if (!config.exports) return undefined

  // Prefer 'default' target, otherwise return first
  return config.exports.default ?? Object.values(config.exports)[0]
}

/**
 * Resolve paths relative to config file location
 */
export function resolveConfigPath(basePath: string, relativePath: string): string {
  if (relativePath.startsWith('./')) {
    return `${basePath}/${relativePath.slice(2)}`
  }
  if (relativePath.startsWith('../')) {
    const baseParts = basePath.split('/')
    baseParts.pop()
    return resolveConfigPath(baseParts.join('/'), relativePath.slice(3))
  }
  return `${basePath}/${relativePath}`
}
