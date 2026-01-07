import type {
  CoralComponentPropertyType,
  CoralElementType,
  CoralRootNode,
  CoralStyleType,
} from '@reallygoodwork/coral-core'
import { extractResponsiveStylesFromObject } from '@reallygoodwork/coral-core'
import { tailwindToCSS } from '@reallygoodwork/coral-tw2css'
import type { UIElement } from './transformReactComponentToCoralSpec'

export const transformUIElementToBaseNode = (
  element: UIElement,
): CoralRootNode => {
  const extractValue = (prop: unknown): unknown => {
    // Handle new format with type and value
    if (prop && typeof prop === 'object' && 'value' in prop) {
      return (prop as { value: unknown }).value
    }
    // Handle legacy format (direct value)
    return prop
  }

  const extractedProps: Record<string, unknown> = {}

  // Extract values from the new component property format
  Object.entries(element.componentProperties || {}).forEach(([key, prop]) => {
    extractedProps[key] = extractValue(prop)
  })

  const { className, styles, ...otherProps } = extractedProps

  const elementAttributes: Record<
    string,
    string | number | boolean | string[]
  > = {}

  // Add other props as element attributes, filtering to allowed types
  Object.entries(otherProps).forEach(([key, value]) => {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      Array.isArray(value)
    ) {
      elementAttributes[key] = value as string | number | boolean | string[]
    }
  })

  // Ensure className is a string before using it
  const classNameStr =
    typeof className === 'string'
      ? className
      : Array.isArray(className)
        ? className.join(' ')
        : ''

  if (classNameStr) {
    elementAttributes.class = classNameStr
  }

  // Preserve the original component properties format (with types)
  const preservedComponentProperties: CoralComponentPropertyType = {}
  Object.entries(element.componentProperties || {}).forEach(([key, prop]) => {
    if (key !== 'className' && key !== 'styles') {
      preservedComponentProperties[key] = prop
    }
  })

  // Combine inline styles and Tailwind classes
  // Ensure styles is properly typed and classNameStr is a string
  const tailwindStyles = tailwindToCSS(classNameStr)
  // tailwindToCSS returns Record<string, string>, which is compatible with CoralStyleType
  const combinedStyles: Record<string, CoralStyleType> = {
    ...(styles && typeof styles === 'object' && !Array.isArray(styles)
      ? (styles as Record<string, CoralStyleType>)
      : {}),
    ...(tailwindStyles as Record<string, CoralStyleType>),
  }

  // Extract responsive styles from media queries
  const { baseStyles, responsiveStyles } =
    extractResponsiveStylesFromObject(combinedStyles)

  const node: CoralRootNode = {
    elementType: element.elementType as CoralElementType,
    componentProperties: preservedComponentProperties,
    // isComponent: element.isComponent,
    name: element.elementType,
    methods: [],
    stateHooks: [],
    componentName: element.elementType,
    styles: baseStyles,
    children: element.children.map(transformUIElementToBaseNode),
    elementAttributes,
  }

  // Add responsive styles if any were found
  if (responsiveStyles.length > 0) {
    node.responsiveStyles = responsiveStyles
  }

  if (element.textContent) {
    node.textContent = element.textContent
  }

  return node
}
