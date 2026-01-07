import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { Command } from 'commander'

import { loadPackage } from '../../lib/packageLoader'
import { validatePackage } from '../../lib/validatePackage'
import { validateProps } from '../../lib/validateProps'

export const validateCommand = new Command('validate')
  .description('Validate a Coral package')
  .argument('[path]', 'Path to package', '.')
  .option('--strict', 'Enable strict mode (warnings as errors)')
  .action(async (packagePath: string, options: { strict?: boolean }) => {
    const configPath = path.resolve(packagePath, 'coral.config.json')

    console.log(`Validating package at ${packagePath}...`)

    try {
      const pkg = await loadPackage(configPath, {
        readFile: (p) => fs.readFile(p, 'utf-8'),
      })

      // Run package validation
      const packageResult = validatePackage(pkg)

      // Run prop validation
      const propResult = validateProps(pkg)

      // Combine results
      const allErrors = [...packageResult.errors, ...propResult.errors]
      const allWarnings = [...packageResult.warnings, ...propResult.warnings]

      if (allErrors.length === 0) {
        console.log(`✓ Package is valid`)
        console.log(`  ${pkg.components.size} components`)
        console.log(`  ${pkg.tokens.size} token files`)
      } else {
        console.log(`✗ Package has ${allErrors.length} error(s)`)
        for (const error of allErrors) {
          console.log(`  [${error.type}] ${error.path}: ${error.message}`)
        }
      }

      if (allWarnings.length > 0) {
        console.log(`\n${allWarnings.length} warning(s):`)
        for (const warning of allWarnings) {
          const location = 'path' in warning ? warning.path : warning.componentName
          console.log(`  [${warning.type}] ${location}: ${warning.message}`)
        }
      }

      // Exit with error code if validation failed
      const hasErrors = allErrors.length > 0
      const hasWarningsInStrict = options.strict && allWarnings.length > 0

      if (hasErrors || hasWarningsInStrict) {
        process.exit(1)
      }
    } catch (err) {
      console.error(`Failed to validate package: ${err}`)
      process.exit(1)
    }
  })
