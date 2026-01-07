import { tailwindToCSS } from '@reallygoodwork/coral-tw2css'
import { HTMLElement, type TextNode } from 'node-html-parser'
import type { CoralRootNode } from '../structures/coral'
import { zCoralElementTypeSchema } from '../structures/elementType'
import type { CoralStyleType } from '../structures/styles'
import { cssStringToDimension } from './convertCSSStringToDimension'
import { createAttributesObject } from './createAttributesObject'
import { extractResponsiveStylesFromObject } from './parseMediaQuery'
import { pascalCaseString } from './pascalCaseString'
import { styleAttributeToObject } from './styleAttributeToObject'

// Dimension properties that should be converted from CSS strings to Dimension objects
const DIMENSION_PROPERTIES = new Set([
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'top',
  'right',
  'bottom',
  'left',
  'gap',
  'rowGap',
  'columnGap',
  'borderRadius',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingBlockStart',
  'paddingBlockEnd',
  'paddingInlineStart',
  'paddingInlineEnd',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginBlockStart',
  'marginBlockEnd',
  'marginInlineStart',
  'marginInlineEnd',
])

/**
 * Converts dimension properties in a styles object from CSS strings/numbers to Dimension objects
 */
function convertDimensionProperties(
  styles: Record<string, unknown>,
): Record<string, unknown> {
  const converted: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(styles)) {
    // Check if this is a dimension property
    if (DIMENSION_PROPERTIES.has(key)) {
      if (typeof value === 'string') {
        // Convert CSS string (e.g., "16px", "100%") to Dimension object
        // Handle special values like "auto" that shouldn't be converted
        if (
          value === 'auto' ||
          value === 'none' ||
          value === 'inherit' ||
          value === 'initial' ||
          value === 'unset'
        ) {
          converted[key] = value
        } else {
          converted[key] = cssStringToDimension(value)
        }
      } else if (typeof value === 'number') {
        // Convert number to Dimension object with 'px' unit
        // Handle all numbers including 0 and negative values
        converted[key] = {
          value: value,
          unit: 'px',
        }
      } else if (
        typeof value === 'object' &&
        value !== null &&
        'value' in value &&
        'unit' in value
      ) {
        // Already a Dimension object, keep as-is
        converted[key] = value
      } else {
        // Keep other types as-is (e.g., arrays, other objects)
        converted[key] = value
      }
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // Recursively process nested objects (for responsive styles, pseudo-selectors, etc.)
      converted[key] = convertDimensionProperties(
        value as Record<string, unknown>,
      )
    } else {
      // Keep other values as-is
      converted[key] = value
    }
  }

  return converted
}

export const parseHTMLNodeToSpec = (node: HTMLElement): CoralRootNode => {
  // Combine inline styles and Tailwind classes
  const combinedStyles = {
    ...styleAttributeToObject(node.getAttribute('style')),
    ...tailwindToCSS(node.getAttribute('class') || ''),
  }

  // Convert dimension properties BEFORE extracting responsive styles
  // This ensures both base and responsive styles have Dimension objects
  const convertedStyles = convertDimensionProperties(combinedStyles)

  // Extract responsive styles from media queries (if any exist in the style object)
  // Type assertion needed here because convertDimensionProperties returns Record<string, unknown>
  // but extractResponsiveStylesFromObject expects Record<string, CoralStyleType>
  // The function validates the structure internally
  const { baseStyles, responsiveStyles } = extractResponsiveStylesFromObject(
    convertedStyles as Record<string, CoralStyleType>,
  )

  // Validate and parse element type
  const rawElementType = node.rawTagName.toLowerCase()
  const elementTypeResult = zCoralElementTypeSchema.safeParse(rawElementType)
  const elementType = elementTypeResult.success
    ? elementTypeResult.data
    : ('div' as const)

  // Create the spec object
  const spec: CoralRootNode = {
    name: pascalCaseString(node.rawTagName),
    elementType,
    styles: baseStyles,
  }

  // Add responsive styles if any were found (they're already converted)
  if (responsiveStyles.length > 0) {
    spec.responsiveStyles = responsiveStyles
  }

  // If the node has attributes, add them to the spec
  if (Object.keys(node.attributes).length) {
    const { style: _styles, ...attributes } = node.attributes
    if (Object.keys(attributes).length) {
      spec.elementAttributes = createAttributesObject(attributes)
    }
  }

  // Initialize children array if there are child nodes
  if (node.childNodes.length > 0) {
    spec.children = []
  }

  // Type guard for TextNode
  function isTextNode(node: unknown): node is TextNode {
    return (
      typeof node === 'object' &&
      node !== null &&
      'nodeType' in node &&
      node.nodeType === 3 &&
      'text' in node &&
      typeof (node as TextNode).text === 'string'
    )
  }

  // Get direct text nodes (not from child elements)
  const directTextNodes = node.childNodes.filter(
    (childNode) => isTextNode(childNode) && !childNode.isWhitespace,
  )

  // Set text content only from direct text nodes
  if (directTextNodes.length > 0) {
    spec.textContent = directTextNodes
      .map((childNode) => (isTextNode(childNode) ? childNode.text.trim() : ''))
      .filter((text) => text.length > 0)
      .join(' ')
  }

  // Parse child elements and add them to children
  node.childNodes.forEach((childNode) => {
    if (childNode instanceof HTMLElement) {
      spec.children?.push(parseHTMLNodeToSpec(childNode))
    }
  })

  return spec
}
