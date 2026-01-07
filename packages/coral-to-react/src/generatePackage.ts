import type { LoadedPackage } from '@reallygoodwork/coral-core'
import {
  getComponentOrder,
  toKebabCase,
  toPascalCase,
} from '@reallygoodwork/coral-core'
import { generateComponent } from './generateComponent'
import type { GeneratedFile, Options, PackageGenerationResult } from './types'

/**
 * Generate React components from a loaded Coral package
 *
 * @param pkg - Loaded package from @reallygoodwork/coral-core
 * @param options - Generation options
 * @returns Package generation result with component files
 *
 * @example
 * ```ts
 * import { loadPackage } from '@reallygoodwork/coral-core'
 * import { generatePackage } from '@reallygoodwork/coral-to-react'
 * import * as fs from 'fs/promises'
 *
 * const pkg = await loadPackage('./coral.config.json', {
 *   readFile: (path) => fs.readFile(path, 'utf-8'),
 * })
 *
 * const result = await generatePackage(pkg, {
 *   componentFormat: 'arrow',
 *   styleFormat: 'className',
 * })
 *
 * // Write files
 * for (const file of result.components) {
 *   await fs.writeFile(`./dist/${file.path}`, file.content)
 * }
 * ```
 */
export async function generatePackage(
  pkg: LoadedPackage,
  options: Options = {},
): Promise<PackageGenerationResult> {
  const { styleFormat = 'inline', includeTypes = true } = options

  const components: GeneratedFile[] = []
  const styles: GeneratedFile[] = []
  const componentImports: string[] = []

  // Get components in dependency order (dependencies first)
  const orderedNames = getComponentOrder(pkg)

  // Generate each component
  for (const name of orderedNames) {
    const component = pkg.components.get(name)
    if (!component) continue

    // Generate component code
    const { reactCode, cssCode } = await generateComponent(component, options)

    // Determine file naming
    const fileCase = pkg.config.exports?.react?.fileCase || 'PascalCase'
    let fileName: string
    switch (fileCase) {
      case 'kebab-case':
        fileName = toKebabCase(name)
        break
      case 'camelCase':
        fileName = name.charAt(0).toLowerCase() + name.slice(1)
        break
      default:
        fileName = toPascalCase(name)
    }

    const fileExt = includeTypes ? 'tsx' : 'jsx'

    // Add component file
    components.push({
      path: `${fileName}.${fileExt}`,
      content: reactCode,
    })

    // Add CSS file if present
    if (cssCode && styleFormat === 'className') {
      styles.push({
        path: `${fileName}.css`,
        content: cssCode,
      })
    }

    // Track for index export
    componentImports.push(name)
  }

  // Generate index file
  const indexContent = generateIndexFile(componentImports, includeTypes)
  const index: GeneratedFile = {
    path: includeTypes ? 'index.ts' : 'index.js',
    content: indexContent,
  }

  return {
    components,
    styles,
    index,
  }
}

/**
 * Generate index file that exports all components
 */
function generateIndexFile(
  componentNames: string[],
  includeTypes: boolean,
): string {
  const exports = componentNames.map((name) => {
    const fileName = name // Assuming PascalCase for simplicity
    return `export { ${name} } from './${fileName}'`
  })

  if (includeTypes) {
    // Also export prop types
    const typeExports = componentNames.map((name) => {
      return `export type { ${name}Props } from './${name}'`
    })
    return [...exports, '', ...typeExports].join('\n')
  }

  return exports.join('\n')
}
