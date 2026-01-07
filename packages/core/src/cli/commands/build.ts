import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { Command } from 'commander'
import {
  generateComponentTypes,
  generatePackageTypes,
} from '../../lib/generateTypes'
import { loadPackage } from '../../lib/packageLoader'

export const buildCommand = new Command('build')
  .description('Build package outputs')
  .argument('[path]', 'Path to package', '.')
  .option('-t, --target <target>', 'Build target (types, json)', 'types')
  .option('-o, --outDir <dir>', 'Output directory')
  .action(
    async (
      packagePath: string,
      options: { target: string; outDir?: string },
    ) => {
      const configPath = path.resolve(packagePath, 'coral.config.json')

      console.log(`Building ${options.target} output...`)

      try {
        const pkg = await loadPackage(configPath, {
          readFile: (p) => fs.readFile(p, 'utf-8'),
        })

        const outDir =
          options.outDir ??
          pkg.config.exports?.[options.target]?.outDir ??
          `./dist/${options.target}`

        await fs.mkdir(path.resolve(packagePath, outDir), { recursive: true })

        if (options.target === 'types') {
          // Generate TypeScript types for all components
          const typesContent = generatePackageTypes(pkg.components)

          await fs.writeFile(
            path.resolve(packagePath, outDir, 'index.d.ts'),
            typesContent,
            'utf-8',
          )

          // Also generate individual type files
          for (const [name, component] of pkg.components) {
            const componentTypes = generateComponentTypes(component)
            const fileName = toKebabCase(name)

            await fs.writeFile(
              path.resolve(packagePath, outDir, `${fileName}.d.ts`),
              componentTypes,
              'utf-8',
            )
          }

          console.log(
            `✓ Built TypeScript types for ${pkg.components.size} components to ${outDir}`,
          )
        } else if (options.target === 'json') {
          // Export as normalized JSON
          for (const [name, component] of pkg.components) {
            const fileName = toKebabCase(name)

            await fs.writeFile(
              path.resolve(packagePath, outDir, `${fileName}.json`),
              JSON.stringify(component, null, 2),
              'utf-8',
            )
          }

          console.log(
            `✓ Built JSON files for ${pkg.components.size} components to ${outDir}`,
          )
        } else {
          console.log(`Unknown target: ${options.target}`)
          console.log(`Available targets: types, json`)
          process.exit(1)
        }
      } catch (err) {
        console.error(`Failed to build package: ${err}`)
        process.exit(1)
      }
    },
  )

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
