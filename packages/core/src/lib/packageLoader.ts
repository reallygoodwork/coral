import type { ComponentIndex } from '../structures/componentIndex'
import { zComponentIndexSchema } from '../structures/componentIndex'
import type { CoralRootNode } from '../structures/coral'
import { zCoralRootSchema } from '../structures/coral'
import type { CoralConfig } from '../structures/package'
import { parsePackageRef, zCoralConfigSchema } from '../structures/package'
import type { TokenIndex } from '../structures/tokenIndex'
import { zTokenIndexSchema } from '../structures/tokenIndex'

/**
 * Loaded package data structure
 */
export interface LoadedPackage {
  /** Parsed package config */
  config: CoralConfig

  /** Map of component names to their definitions */
  components: Map<string, CoralRootNode>

  /** Parsed component index (if present) */
  componentIndex: ComponentIndex | null

  /** Parsed token index (if present) */
  tokenIndex: TokenIndex | null

  /** Map of token file paths to their data */
  tokens: Map<string, unknown>

  /** Base path of the package */
  basePath: string
}

/**
 * Options for loading a package
 */
export interface PackageLoaderOptions {
  /** Custom file reader (for different environments) */
  readFile: (path: string) => Promise<string>

  /** Resolve package from registry (for extends) */
  resolvePackage?: (name: string) => Promise<string>

  /** Whether to load extended packages */
  resolveExtends?: boolean
}

/**
 * Load a Coral package from disk or other source
 *
 * @param configPath - Path to coral.config.json
 * @param options - Loader options
 * @returns Loaded package data
 *
 * @example
 * ```ts
 * import * as fs from 'fs/promises'
 *
 * const pkg = await loadPackage('./my-design-system/coral.config.json', {
 *   readFile: (path) => fs.readFile(path, 'utf-8'),
 * })
 *
 * console.log(`Loaded ${pkg.components.size} components`)
 * ```
 */
export async function loadPackage(
  configPath: string,
  options: PackageLoaderOptions,
): Promise<LoadedPackage> {
  const { readFile, resolveExtends = true } = options

  // Get base path from config path
  const basePath = configPath.replace(/\/coral\.config\.json$/, '')

  // Load and validate config
  const configRaw = await readFile(configPath)
  const configJson = JSON.parse(configRaw)
  const configResult = zCoralConfigSchema.safeParse(configJson)

  if (!configResult.success) {
    throw new Error(`Invalid coral.config.json: ${configResult.error.message}`)
  }

  const config = configResult.data

  // Load extended packages first (if any)
  const extendedPackages: LoadedPackage[] = []
  if (resolveExtends && config.extends) {
    for (const extendRef of config.extends) {
      const [packageName] = parsePackageRef(extendRef)
      const packagePath =
        (await options.resolvePackage?.(packageName)) ??
        `node_modules/${packageName}`

      const extended = await loadPackage(
        `${packagePath}/coral.config.json`,
        options,
      )
      extendedPackages.push(extended)
    }
  }

  // Load component index
  let componentIndex: ComponentIndex | null = null
  const components = new Map<string, CoralRootNode>()

  if (config.components?.entry) {
    const indexPath = resolvePath(basePath, config.components.entry)
    try {
      const indexRaw = await readFile(indexPath)
      const indexJson = JSON.parse(indexRaw)
      const indexResult = zComponentIndexSchema.safeParse(indexJson)

      if (indexResult.success) {
        componentIndex = indexResult.data

        // Load each component
        const indexDir = indexPath.replace(/\/[^/]+$/, '')
        for (const entry of componentIndex.components) {
          const componentPath = resolvePath(indexDir, entry.path)
          try {
            const componentRaw = await readFile(componentPath)
            const componentJson = JSON.parse(componentRaw)
            const componentResult = zCoralRootSchema.safeParse(componentJson)

            if (componentResult.success) {
              components.set(entry.name, componentResult.data)
            } else {
              console.warn(
                `Failed to parse component ${entry.name}: ${componentResult.error.message}`,
              )
            }
          } catch (err) {
            console.warn(`Failed to load component ${entry.name}: ${err}`)
          }
        }
      }
    } catch {
      // Component index is optional
    }
  }

  // Load token index
  let tokenIndex: TokenIndex | null = null
  const tokens = new Map<string, unknown>()

  if (config.tokens?.entry) {
    const indexPath = resolvePath(basePath, config.tokens.entry)
    try {
      const indexRaw = await readFile(indexPath)
      const indexJson = JSON.parse(indexRaw)
      const indexResult = zTokenIndexSchema.safeParse(indexJson)

      if (indexResult.success) {
        tokenIndex = indexResult.data

        // Load each token source
        const indexDir = indexPath.replace(/\/[^/]+$/, '')
        for (const source of tokenIndex.sources) {
          const tokenPath = resolvePath(indexDir, source.path)
          try {
            const tokenRaw = await readFile(tokenPath)
            tokens.set(source.path, JSON.parse(tokenRaw))
          } catch {
            // Token files are optional
          }
        }
      }
    } catch {
      // Token index is optional
    }
  }

  // Merge with extended packages (local overrides extended)
  const mergedComponents = new Map<string, CoralRootNode>()
  const mergedTokens = new Map<string, unknown>()

  for (const extended of extendedPackages) {
    for (const [name, component] of extended.components) {
      mergedComponents.set(name, component)
    }
    for (const [path, tokenData] of extended.tokens) {
      mergedTokens.set(path, tokenData)
    }
  }

  // Local overrides extended
  for (const [name, component] of components) {
    mergedComponents.set(name, component)
  }
  for (const [path, tokenData] of tokens) {
    mergedTokens.set(path, tokenData)
  }

  return {
    config,
    components: mergedComponents,
    componentIndex,
    tokenIndex,
    tokens: mergedTokens,
    basePath,
  }
}

/**
 * Resolve a relative path from a base path
 */
function resolvePath(base: string, relative: string): string {
  if (relative.startsWith('./')) {
    return `${base}/${relative.slice(2)}`
  }
  if (relative.startsWith('../')) {
    const baseParts = base.split('/')
    baseParts.pop()
    return resolvePath(baseParts.join('/'), relative.slice(3))
  }
  return `${base}/${relative}`
}

/**
 * Get a component by name from a loaded package
 */
export function getComponent(
  pkg: LoadedPackage,
  name: string,
): CoralRootNode | undefined {
  return pkg.components.get(name)
}

/**
 * Get all component names from a loaded package
 */
export function getComponentNames(pkg: LoadedPackage): string[] {
  return Array.from(pkg.components.keys())
}

/**
 * Check if a package has a specific component
 */
export function hasComponent(pkg: LoadedPackage, name: string): boolean {
  return pkg.components.has(name)
}
