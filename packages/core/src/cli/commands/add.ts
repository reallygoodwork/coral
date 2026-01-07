import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { Command } from 'commander'

import { loadPackage } from '../../lib/packageLoader'
import { writeComponent, createComponentScaffold } from '../../lib/packageWriter'
import { addComponentToIndex, zComponentIndexSchema } from '../../structures/componentIndex'

export const addCommand = new Command('add')
  .description('Add a new component to the package')
  .argument('<type>', 'Type to add (component)')
  .argument('<name>', 'Name of the component')
  .option('-c, --category <category>', 'Component category')
  .option('-e, --element <element>', 'Root element type', 'div')
  .option('-d, --description <description>', 'Component description')
  .action(
    async (
      type: string,
      name: string,
      options: { category?: string; element?: string; description?: string },
    ) => {
      if (type !== 'component') {
        console.error(`Unknown type: ${type}. Supported types: component`)
        process.exit(1)
      }

      const packagePath = process.cwd()
      const configPath = path.resolve(packagePath, 'coral.config.json')

      console.log(`Adding component: ${name}`)

      try {
        // Load the package
        const pkg = await loadPackage(configPath, {
          readFile: (p) => fs.readFile(p, 'utf-8'),
        })

        // Check if component already exists
        if (pkg.components.has(name)) {
          console.error(`Component "${name}" already exists`)
          process.exit(1)
        }

        // Create component scaffold
        const component = createComponentScaffold(name, {
          elementType: options.element,
          category: options.category,
          description: options.description,
        })

        // Write component file
        const componentPath = await writeComponent(packagePath, name, component, {
          writeFile: async (filePath, content) => {
            await fs.mkdir(path.dirname(filePath), { recursive: true })
            await fs.writeFile(filePath, content, 'utf-8')
          },
          mkdir: async (dirPath) => {
            await fs.mkdir(dirPath, { recursive: true })
          },
        })

        // Update component index
        if (pkg.componentIndex) {
          const fileName = toKebabCase(name)
          const updatedIndex = addComponentToIndex(pkg.componentIndex, {
            name,
            path: `./${fileName}/${fileName}.coral.json`,
            category: options.category,
            status: 'draft',
          })

          const indexPath = path.resolve(packagePath, 'components/index.json')
          await fs.writeFile(indexPath, JSON.stringify(updatedIndex, null, 2), 'utf-8')
        }

        console.log(`✓ Created component at ${componentPath}`)
        console.log(`\nNext steps:`)
        console.log(`  - Edit the component file to add structure and styles`)
        console.log(`  - Run 'coral validate' to check your changes`)
      } catch (err) {
        console.error(`Failed to add component: ${err}`)
        process.exit(1)
      }
    },
  )

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
