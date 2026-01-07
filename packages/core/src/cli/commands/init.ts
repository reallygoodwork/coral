import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { Command } from 'commander'

import { createDefaultConfig } from '../../structures/package'
import { createDefaultTokenIndex } from '../../structures/tokenIndex'
import { writePackage } from '../../lib/packageWriter'

export const initCommand = new Command('init')
  .description('Initialize a new Coral package')
  .argument('<name>', 'Package name')
  .option('-d, --dir <directory>', 'Target directory', '.')
  .action(async (name: string, options: { dir: string }) => {
    const targetDir = path.resolve(options.dir, name)

    console.log(`Creating new Coral package: ${name}`)

    const config = createDefaultConfig(name)

    await writePackage(
      targetDir,
      {
        config,
        components: new Map(),
      },
      {
        writeFile: async (filePath, content) => {
          await fs.mkdir(path.dirname(filePath), { recursive: true })
          await fs.writeFile(filePath, content, 'utf-8')
        },
        mkdir: async (dirPath) => {
          await fs.mkdir(dirPath, { recursive: true })
        },
      },
    )

    // Create token index
    const tokenIndex = createDefaultTokenIndex(`${name} Tokens`, '0.1.0')

    await fs.mkdir(`${targetDir}/tokens`, { recursive: true })
    await fs.writeFile(
      `${targetDir}/tokens/index.json`,
      JSON.stringify(tokenIndex, null, 2),
    )

    // Create empty token files
    await fs.writeFile(
      `${targetDir}/tokens/primitives.tokens.json`,
      JSON.stringify(
        {
          $schema: 'https://coral.design/tokens.schema.json',
          color: {
            white: { $value: '#ffffff' },
            black: { $value: '#000000' },
          },
        },
        null,
        2,
      ),
    )

    await fs.writeFile(
      `${targetDir}/tokens/semantic.tokens.json`,
      JSON.stringify(
        {
          $schema: 'https://coral.design/tokens.schema.json',
          color: {
            background: {
              primary: { $value: '{color.white}' },
            },
            text: {
              primary: { $value: '{color.black}' },
            },
          },
        },
        null,
        2,
      ),
    )

    console.log(`✓ Created package at ${targetDir}`)
    console.log(`\nNext steps:`)
    console.log(`  cd ${name}`)
    console.log(`  coral add component Button`)
  })
