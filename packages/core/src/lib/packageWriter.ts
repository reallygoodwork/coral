import type { ComponentIndex } from '../structures/componentIndex'
import type { CoralRootNode } from '../structures/coral'
import { zCoralElementTypeSchema } from '../structures/elementType'
import type { CoralConfig } from '../structures/package'
import type { TokenIndex } from '../structures/tokenIndex'

/**
 * Options for writing a package
 */
export interface PackageWriterOptions {
  /** Write file to disk */
  writeFile: (path: string, content: string) => Promise<void>

  /** Create directory */
  mkdir: (path: string) => Promise<void>
}

/**
 * Data to write as a package
 */
export interface PackageData {
  /** Package configuration */
  config: CoralConfig

  /** Components to write */
  components: Map<string, CoralRootNode>

  /** Tokens to write (optional) */
  tokens?: Map<string, unknown>
}

/**
 * Write a Coral package to disk
 *
 * @param basePath - Base directory to write to
 * @param data - Package data to write
 * @param options - Writer options
 *
 * @example
 * ```ts
 * import * as fs from 'fs/promises'
 *
 * await writePackage('./my-design-system', {
 *   config: { name: 'my-design-system', version: '1.0.0', ... },
 *   components: new Map([['Button', buttonComponent]]),
 * }, {
 *   writeFile: (path, content) => fs.writeFile(path, content, 'utf-8'),
 *   mkdir: (path) => fs.mkdir(path, { recursive: true }),
 * })
 * ```
 */
export async function writePackage(
  basePath: string,
  data: PackageData,
  options: PackageWriterOptions,
): Promise<void> {
  const { writeFile, mkdir } = options

  // Ensure directories exist
  await mkdir(basePath)
  await mkdir(`${basePath}/components`)
  if (data.tokens) {
    await mkdir(`${basePath}/tokens`)
  }

  // Write config
  await writeFile(
    `${basePath}/coral.config.json`,
    JSON.stringify(data.config, null, 2),
  )

  // Write components
  const componentEntries: Array<{
    name: string
    path: string
    category?: string
    status?: 'draft' | 'beta' | 'stable' | 'deprecated'
    tags?: string[]
  }> = []

  for (const [name, component] of data.components) {
    const fileName = toKebabCase(name)
    const dirPath = `${basePath}/components/${fileName}`
    const filePath = `${dirPath}/${fileName}.coral.json`

    await mkdir(dirPath)
    await writeFile(filePath, JSON.stringify(component, null, 2))

    componentEntries.push({
      name,
      path: `./${fileName}/${fileName}.coral.json`,
      category: component.$meta?.category,
      status: component.$meta?.status,
      tags: component.$meta?.tags,
    })
  }

  // Write component index
  const componentIndex: ComponentIndex = {
    $schema: 'https://coral.design/components-index.schema.json',
    name: `${data.config.name} Components`,
    version: data.config.version,
    components: componentEntries,
  }

  await writeFile(
    `${basePath}/components/index.json`,
    JSON.stringify(componentIndex, null, 2),
  )

  // Write tokens if present
  if (data.tokens) {
    const tokenSources: Array<{
      path: string
      layer?: 'primitive' | 'semantic' | 'component'
    }> = []

    for (const [path, tokenData] of data.tokens) {
      await writeFile(
        `${basePath}/tokens/${path}`,
        JSON.stringify(tokenData, null, 2),
      )
      tokenSources.push({ path: `./${path}` })
    }

    // Write token index
    const tokenIndex: TokenIndex = {
      $schema: 'https://coral.design/tokens-index.schema.json',
      name: `${data.config.name} Tokens`,
      version: data.config.version,
      sources: tokenSources,
    }

    await writeFile(
      `${basePath}/tokens/index.json`,
      JSON.stringify(tokenIndex, null, 2),
    )
  }
}

/**
 * Write a single component to disk
 */
export async function writeComponent(
  basePath: string,
  name: string,
  component: CoralRootNode,
  options: PackageWriterOptions,
): Promise<string> {
  const { writeFile, mkdir } = options

  const fileName = toKebabCase(name)
  const dirPath = `${basePath}/components/${fileName}`
  const filePath = `${dirPath}/${fileName}.coral.json`

  await mkdir(dirPath)
  await writeFile(filePath, JSON.stringify(component, null, 2))

  return filePath
}

/**
 * Write token files to disk
 */
export async function writeTokens(
  basePath: string,
  tokens: Map<string, unknown>,
  options: PackageWriterOptions,
): Promise<void> {
  const { writeFile, mkdir } = options

  await mkdir(`${basePath}/tokens`)

  for (const [path, tokenData] of tokens) {
    await writeFile(
      `${basePath}/tokens/${path}`,
      JSON.stringify(tokenData, null, 2),
    )
  }
}

/**
 * Convert PascalCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

/**
 * Create an empty component scaffold
 */
export function createComponentScaffold(
  name: string,
  options?: {
    elementType?: string
    category?: string
    description?: string
  },
): CoralRootNode {
  // Validate element type
  const elementTypeResult = zCoralElementTypeSchema.safeParse(
    options?.elementType ?? 'div',
  )
  const elementType = elementTypeResult.success
    ? elementTypeResult.data
    : ('div' as const)

  return {
    name,
    elementType,
    type: 'NODE',
    $meta: {
      name,
      version: '0.1.0',
      status: 'draft',
      category: options?.category,
      description: options?.description,
    },
    styles: {},
    children: [],
  }
}

/**
 * Create empty token files for a package
 */
export function createTokenScaffold(): Map<string, unknown> {
  const tokens = new Map<string, unknown>()

  tokens.set('primitives.tokens.json', {
    $schema: 'https://coral.design/tokens.schema.json',
    color: {
      white: { $value: '#ffffff' },
      black: { $value: '#000000' },
    },
  })

  tokens.set('semantic.tokens.json', {
    $schema: 'https://coral.design/tokens.schema.json',
    color: {
      background: {
        primary: { $value: '{color.white}' },
      },
      text: {
        primary: { $value: '{color.black}' },
      },
    },
  })

  return tokens
}
