import type {
  CoralComponentPropertyType,
  CoralRootNode,
  CoralTSTypes,
  ComponentPropsDefinition,
} from '@reallygoodwork/coral-core'
import { generatePropsInterface as generateCorePropsInterface } from '@reallygoodwork/coral-core'

/**
 * Converts Coral TypeScript type to TypeScript type string
 */
function tsTypeToString(tsType: CoralTSTypes | CoralTSTypes[]): string {
  if (Array.isArray(tsType)) {
    return tsType.map(tsTypeToString).join(' | ')
  }
  if (tsType === null || tsType === undefined) {
    return 'unknown'
  }
  return tsType
}

/**
 * Generates TypeScript interface for component props (overloaded)
 */
export function generatePropsInterface(
  componentPropertiesOrSpec: CoralComponentPropertyType | CoralRootNode,
  componentName?: string,
): string {
  // If it's a CoralRootNode with new props definition, use core generator
  if (
    typeof componentPropertiesOrSpec === 'object' &&
    componentPropertiesOrSpec !== null &&
    'props' in componentPropertiesOrSpec &&
    componentPropertiesOrSpec.props
  ) {
    const spec = componentPropertiesOrSpec as CoralRootNode
    return generateCorePropsInterface(spec)
  }

  // If it's a CoralRootNode with legacy componentProperties, extract them
  let componentProperties: CoralComponentPropertyType | undefined
  if (
    typeof componentPropertiesOrSpec === 'object' &&
    componentPropertiesOrSpec !== null &&
    'componentProperties' in componentPropertiesOrSpec
  ) {
    const spec = componentPropertiesOrSpec as CoralRootNode
    componentProperties = spec.componentProperties
    componentName = componentName || spec.componentName || spec.name
  } else {
    // Otherwise, it's already componentProperties
    componentProperties = componentPropertiesOrSpec as CoralComponentPropertyType | undefined
  }

  if (!componentProperties || Object.keys(componentProperties).length === 0) {
    return ''
  }

  const interfaceName = componentName ? `${componentName}Props` : 'Props'
  const properties: string[] = []

  for (const [propName, propValue] of Object.entries(componentProperties)) {
    if (typeof propValue === 'object' && propValue !== null && 'type' in propValue) {
      const prop = propValue as {
        type?: CoralTSTypes | CoralTSTypes[]
        defaultValue?: unknown
        optional?: boolean
        description?: string
      }

      const typeStr = prop.type ? tsTypeToString(prop.type) : 'unknown'
      const optional = prop.optional !== false ? '?' : ''
      const description = prop.description ? ` // ${prop.description}` : ''

      properties.push(`  ${propName}${optional}: ${typeStr}${description}`)
    } else {
      // Simple value, infer type
      const typeStr =
        typeof propValue === 'object' && propValue !== null && 'value' in propValue
          ? typeof (propValue as { value: unknown }).value
          : typeof propValue
      properties.push(`  ${propName}?: ${typeStr}`)
    }
  }

  if (properties.length === 0) {
    return ''
  }

  return `interface ${interfaceName} {\n${properties.join('\n')}\n}`
}
