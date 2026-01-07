import type { CoralNode } from '@reallygoodwork/coral-core'
import {
  extractComponentName,
  isComponentInstance,
  isPropBinding,
} from '@reallygoodwork/coral-core'
import type { ComponentInstance } from '@reallygoodwork/coral-core'
import { stylesToInlineStyle } from './convertStyles'

/**
 * List of self-closing HTML elements
 */
const selfClosingTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

/**
 * Formats attributes for JSX
 */
function formatJSXAttributes(
  elementAttributes?: Record<string, string | number | boolean | string[]>,
  className?: string,
  inlineStyle?: string,
): string {
  const attrs: string[] = []
  let existingClassName: string | undefined

  if (elementAttributes) {
    for (const [key, value] of Object.entries(elementAttributes)) {
      if (key === 'class' || key === 'className') {
        // Store existing className to combine with generated classes later
        existingClassName = Array.isArray(value) ? value.join(' ') : String(value)
        continue // Skip adding it now, we'll add it later
      }

      if (Array.isArray(value)) {
        attrs.push(`${key}={[${value.map((v) => `'${v}'`).join(', ')}]}`)
      } else if (typeof value === 'boolean') {
        if (value) {
          attrs.push(key)
        }
      } else if (typeof value === 'number') {
        attrs.push(`${key}={${value}}`)
      } else {
        attrs.push(`${key}="${String(value).replace(/"/g, '&quot;')}"`)
      }
    }
  }

  // Combine existing className with generated CSS classes
  if (className || existingClassName) {
    const combinedClasses = [existingClassName, className].filter(Boolean).join(' ')
    attrs.push(`className="${combinedClasses}"`)
  }

  if (inlineStyle) {
    attrs.push(`style={${inlineStyle}}`)
  }

  return attrs.length > 0 ? ` ${attrs.join(' ')}` : ''
}

/**
 * Generate unique ID for a node based on its path in the tree
 */
function generateNodeId(node: CoralNode, parentPath: string = '', index: number = 0): string {
  const nodeName = (node.name || node.elementType).toLowerCase()
  const currentPath = parentPath ? `${parentPath}-${index}` : 'root'
  return `coral-${currentPath}-${nodeName}`
}

/**
 * Generates JSX element from Coral node
 * @param node - Coral node specification
 * @param indent - Current indentation level
 * @param idMapping - Map of nodes to their generated IDs for CSS classes
 * @param parentPath - Parent path for ID generation
 * @param index - Index of this node among siblings
 * @param styleFormat - Style format: 'inline' or 'className'
 * @returns JSX element string
 */
export function generateJSXElement(
  node: CoralNode,
  indent: number = 0,
  idMapping: Map<CoralNode, string> = new Map(),
  parentPath: string = '',
  index: number = 0,
  styleFormat: 'inline' | 'className' = 'inline',
): string {
  const indentStr = '  '.repeat(indent)

  // Handle component instances
  if (isComponentInstance(node)) {
    return generateComponentInstanceJSX(
      node as unknown as ComponentInstance,
      indent,
      idMapping,
      parentPath,
      index,
      styleFormat,
    )
  }

  const elementType = node.elementType
  const isSelfClosing = selfClosingTags.includes(elementType)

  // Ensure node has an ID in the mapping (create if doesn't exist)
  const nodeId = idMapping.get(node) || generateNodeId(node, parentPath, index)
  if (!idMapping.has(node)) {
    idMapping.set(node, nodeId)
  }

  // Generate inline styles or className based on styleFormat
  let className: string | undefined
  let inlineStyle: string | undefined

  if (styleFormat === 'inline') {
    inlineStyle = stylesToInlineStyle(node.styles)
  } else {
    className = nodeId
  }

  // Format attributes
  const attributes = formatJSXAttributes(node.elementAttributes, className, inlineStyle)

  // Handle self-closing elements
  if (isSelfClosing) {
    return `${indentStr}<${elementType}${attributes} />`
  }

  // Handle text content
  const textContent = node.textContent || ''

  // Handle children
  const children: string[] = []
  if (textContent) {
    children.push(`${indentStr}  ${textContent}`)
  }
  if (node.children && node.children.length > 0) {
    for (let idx = 0; idx < node.children.length; idx++) {
      const child = node.children[idx] as CoralNode
      children.push(generateJSXElement(child, indent + 1, idMapping, nodeId, idx, styleFormat))
    }
  }

  if (children.length === 0) {
    return `${indentStr}<${elementType}${attributes}></${elementType}>`
  }

  const childrenStr = children.join('\n')
  return `${indentStr}<${elementType}${attributes}>\n${childrenStr}\n${indentStr}</${elementType}>`
}

/**
 * Generate JSX for a component instance
 */
function generateComponentInstanceJSX(
  instance: ComponentInstance,
  indent: number,
  idMapping: Map<CoralNode, string>,
  parentPath: string,
  index: number,
  styleFormat: 'inline' | 'className' = 'inline',
): string {
  const indentStr = '  '.repeat(indent)
  const componentName = extractComponentName(instance.$component.ref)

  // Build props
  const propAttrs: string[] = []

  // Add prop bindings
  if (instance.propBindings) {
    for (const [propName, binding] of Object.entries(instance.propBindings)) {
      if (isPropBinding(binding)) {
        // Dynamic prop reference: {$prop: "parentProp"}
        propAttrs.push(`${propName}={props.${binding.$prop}}`)
      } else {
        // Static value
        if (typeof binding === 'string') {
          propAttrs.push(`${propName}="${binding}"`)
        } else if (typeof binding === 'number') {
          propAttrs.push(`${propName}={${binding}}`)
        } else if (typeof binding === 'boolean') {
          if (binding) {
            propAttrs.push(propName)
          }
        } else {
          // Complex object - stringify
          propAttrs.push(`${propName}={${JSON.stringify(binding)}}`)
        }
      }
    }
  }

  // Add variant overrides
  if (instance.variantOverrides) {
    for (const [variantName, value] of Object.entries(instance.variantOverrides)) {
      propAttrs.push(`${variantName}="${value}"`)
    }
  }

  // Handle event bindings
  if (instance.eventBindings) {
    for (const [eventName, binding] of Object.entries(instance.eventBindings)) {
      if (binding && typeof binding === 'object' && '$event' in binding) {
        propAttrs.push(`${eventName}={props.${binding.$event}}`)
      }
    }
  }

  const attrsStr = propAttrs.length > 0 ? ` ${propAttrs.join(' ')}` : ''

  // Handle slot bindings
  if (instance.slotBindings) {
    const slots = Object.entries(instance.slotBindings)
    if (slots.length > 0) {
      const slotContent: string[] = []
      for (const [slotName, binding] of slots) {
        if (typeof binding === 'string') {
          slotContent.push(`${indentStr}  ${binding}`)
        } else if (
          binding &&
          typeof binding === 'object' &&
          '$prop' in binding
        ) {
          slotContent.push(`${indentStr}  {props.${binding.$prop}}`)
        } else if (Array.isArray(binding)) {
          // Nested nodes - render as JSX
          for (let idx = 0; idx < binding.length; idx++) {
            const node = binding[idx] as CoralNode | undefined
            if (node) {
              slotContent.push(
                generateJSXElement(node, indent + 1, idMapping, parentPath, idx, styleFormat),
              )
            }
          }
        }
      }

      if (slotContent.length > 0) {
        const childrenStr = slotContent.join('\n')
        return `${indentStr}<${componentName}${attrsStr}>\n${childrenStr}\n${indentStr}</${componentName}>`
      }
    }
  }

  // No children - self-closing
  return `${indentStr}<${componentName}${attrsStr} />`
}
