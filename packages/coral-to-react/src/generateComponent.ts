import type { CoralNode, CoralRootNode } from '@reallygoodwork/coral-core'
import {
  extractComponentName,
  findComponentInstances,
} from '@reallygoodwork/coral-core'
import * as parserBabel from 'prettier/plugins/babel'
import * as prettier from 'prettier/standalone'
import { generateCSS } from './generateCSS'
import { generateCVA } from './generateCVA'
import { generateImports } from './generateImports'
import { generateJSXElement } from './generateJSX'
import { generateMethods } from './generateMethod'
import { generatePropsInterface } from './generatePropsInterface'
import { generateStateHooks } from './generateStateHooks'
import type { Options } from './types'

/**
 * Generates a React component from a Coral specification
 * @param spec - Coral root node specification
 * @param options - Generation options
 * @returns Object with reactCode and cssCode strings
 */
export async function generateComponent(
  spec: CoralRootNode,
  options: Options = {},
): Promise<{ reactCode: string; cssCode: string }> {
  const {
    componentFormat = 'function',
    styleFormat = 'inline',
    includeTypes = true,
    indentSize = 2,
    prettier: usePrettier = false,
    variantStrategy = 'inline',
  } = options

  const componentName = spec.componentName || spec.name || 'Component'
  const indentStr = ' '.repeat(indentSize)
  const useCSS = styleFormat === 'className'

  // Auto-detect CVA usage if component has variants and strategy is not explicitly set
  const hasVariants =
    spec.componentVariants?.axes && spec.componentVariants.axes.length > 0
  const useCVA =
    variantStrategy === 'cva' || (hasVariants && styleFormat === 'className')

  // Generate ID mapping for CSS classes (shared between CSS and JSX generation)
  const idMapping = new Map<CoralNode, string>()

  // Generate CSS if using className format
  let cssContent = ''
  if (useCSS) {
    cssContent = generateCSS(spec, idMapping)
  }

  // Generate imports
  const imports = generateImports(spec.imports)

  // Find component dependencies and add imports
  const componentInstances = findComponentInstances(spec)
  const componentImports = componentInstances.map((inst) =>
    extractComponentName(inst.instance.$component.ref),
  )
  const uniqueComponentImports = [...new Set(componentImports)]

  // Generate CVA config if using variants with Tailwind
  let cvaCode = ''
  let cvaImports: string[] = []
  if (useCVA && hasVariants) {
    const cvaResult = generateCVA(spec)
    cvaCode = cvaResult.code
    cvaImports = cvaResult.imports
  }

  // Generate props interface
  const propsInterface = includeTypes
    ? generatePropsInterface(spec, componentName)
    : ''

  // Add variant axes to props interface if they exist
  let variantPropsAddition = ''
  if (hasVariants && includeTypes && spec.componentVariants?.axes) {
    const variantProps = spec.componentVariants.axes
      .map((axis) => {
        const values = axis.values.map((v) => `'${v}'`).join(' | ')
        return `  ${axis.name}?: ${values}`
      })
      .join('\n')
    variantPropsAddition = variantProps
  }

  // Generate state hooks
  const stateHooks = generateStateHooks(spec.stateHooks)

  // Generate methods
  const methods = generateMethods(spec.methods)

  // Generate JSX (using same ID mapping so classes match)
  const jsx = generateJSXElement(spec, 0, idMapping, '', 0, styleFormat)

  // Build component
  const parts: string[] = [imports]

  // Add CVA imports
  if (cvaImports.length > 0) {
    parts.push(...cvaImports)
  }

  // Add component imports
  if (uniqueComponentImports.length > 0) {
    for (const compName of uniqueComponentImports) {
      parts.push(`import { ${compName} } from './${compName}'`)
    }
  }

  // Add CSS import if using CSS classes
  if (useCSS && cssContent) {
    parts.push(`import './${componentName}.css'`)
  }

  if (propsInterface) {
    parts.push('')
    // Insert variant props if needed
    if (variantPropsAddition) {
      const propsWithVariants = propsInterface.replace(
        /interface\s+\w+Props\s*{/,
        (match) => `${match}\n${variantPropsAddition}`,
      )
      parts.push(propsWithVariants)
    } else {
      parts.push(propsInterface)
    }
  }

  // Add CVA config
  if (cvaCode) {
    parts.push('')
    parts.push(cvaCode)
  }

  parts.push('')

  // Generate CVA className call if using variants
  let cvaClassNameCall = ''
  if (useCVA && hasVariants && spec.componentVariants?.axes) {
    const variantProps = spec.componentVariants.axes.map((axis) => axis.name)
    const propsDestructure = variantProps.map((name) => name).join(', ')
    cvaClassNameCall = `${indentStr}const className = componentVariants({ ${propsDestructure} })`
  }

  if (componentFormat === 'arrow') {
    // Arrow function component
    const propsType =
      includeTypes && propsInterface ? `: ${componentName}Props` : ''
    const hasProps =
      spec.componentProperties &&
      Object.keys(spec.componentProperties).length > 0
    const propsParam =
      hasProps || hasVariants
        ? includeTypes && propsInterface
          ? `props${propsType}`
          : 'props'
        : ''
    const componentStart = `export const ${componentName} = (${propsParam}) => {`
    parts.push(componentStart)

    // Destructure variant props if using CVA
    if (useCVA && hasVariants && spec.componentVariants?.axes) {
      const variantProps = spec.componentVariants.axes.map((axis) => axis.name)
      const destructure = `${indentStr}const { ${variantProps.join(', ')}, ...rest } = props || {}`
      parts.push(destructure)
    }

    if (cvaClassNameCall) {
      parts.push('')
      parts.push(cvaClassNameCall)
    }

    if (stateHooks) {
      parts.push('')
      parts.push(
        stateHooks
          .split('\n')
          .map((line) => `${indentStr}${line}`)
          .join('\n'),
      )
    }

    if (methods) {
      parts.push('')
      parts.push(
        methods
          .split('\n')
          .map((line) => `${indentStr}${line}`)
          .join('\n'),
      )
    }

    parts.push('')
    parts.push(`${indentStr}return (`)
    parts.push(
      jsx
        .split('\n')
        .map((line) => `${indentStr}${indentStr}${line.trimStart()}`)
        .join('\n'),
    )
    parts.push(`${indentStr})`)
    parts.push('}')
  } else {
    // Function declaration component
    const propsType =
      includeTypes && propsInterface ? `: ${componentName}Props` : ''
    const hasProps =
      spec.componentProperties &&
      Object.keys(spec.componentProperties).length > 0
    const propsParam =
      hasProps || hasVariants
        ? includeTypes && propsInterface
          ? `props${propsType}`
          : 'props'
        : ''
    const componentStart = `export function ${componentName}(${propsParam}) {`
    parts.push(componentStart)

    // Destructure variant props if using CVA
    if (useCVA && hasVariants && spec.componentVariants?.axes) {
      const variantProps = spec.componentVariants.axes.map((axis) => axis.name)
      const destructure = `${indentStr}const { ${variantProps.join(', ')}, ...rest } = props || {}`
      parts.push(destructure)
    }

    if (cvaClassNameCall) {
      parts.push('')
      parts.push(cvaClassNameCall)
    }

    if (stateHooks) {
      parts.push('')
      parts.push(
        stateHooks
          .split('\n')
          .map((line) => `${indentStr}${line}`)
          .join('\n'),
      )
    }

    if (methods) {
      parts.push('')
      parts.push(
        methods
          .split('\n')
          .map((line) => `${indentStr}${line}`)
          .join('\n'),
      )
    }

    parts.push('')
    parts.push(`${indentStr}return (`)
    parts.push(
      jsx
        .split('\n')
        .map((line) => `${indentStr}${indentStr}${line.trimStart()}`)
        .join('\n'),
    )
    parts.push(`${indentStr})`)
    parts.push('}')
  }

  const code = parts.join('\n')

  // Format with Prettier if requested
  let formattedCode = code
  if (usePrettier) {
    try {
      formattedCode = await prettier.format(code, {
        parser: 'babel-ts',
        plugins: [parserBabel],
        semi: true,
        singleQuote: true,
        tabWidth: indentSize,
        trailingComma: 'es5',
        arrowParens: 'always',
      })
    } catch (error) {
      // If Prettier fails, return unformatted code
      console.warn('Prettier formatting failed:', error)
      formattedCode = code
    }
  }

  return {
    reactCode: formattedCode,
    cssCode: cssContent,
  }
}
