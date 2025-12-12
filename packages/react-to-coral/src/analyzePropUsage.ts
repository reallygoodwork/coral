import generate from '@babel/generator'
import traverse, { type NodePath } from '@babel/traverse'
import * as t from '@babel/types'

import type { CoralComponentPropertyType } from '@reallygoodwork/coral-core'

export interface PropUsageContext {
  location: string // Framework-agnostic location description
  expression: string // The actual expression or code where prop is used
  type:
    | 'binding'
    | 'interpolation'
    | 'conditional'
    | 'iteration'
    | 'event'
    | 'reference'
}

export interface PropUsageInfo {
  isUsed: boolean
  contexts: PropUsageContext[]
  dependencies: string[] // Other props/state this prop depends on
}

/**
 * Analyzes how props are used within a React component and provides
 * framework-agnostic usage metadata for transformation to other UI libraries
 */
export const analyzePropUsage = (
  ast: t.File,
  componentProperties: CoralComponentPropertyType,
): Record<string, PropUsageInfo> => {
  const propNames = Object.keys(componentProperties)
  const usageMap: Record<string, PropUsageInfo> = {}

  // Initialize usage info for all props
  propNames.forEach((propName) => {
    usageMap[propName] = {
      isUsed: false,
      contexts: [],
      dependencies: [],
    }
  })

  // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
  traverse(ast as any, {
    // Analyze JSX elements for prop usage in templates
    JSXElement(path) {
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
      analyzeJSXForPropUsage(path as any, propNames, usageMap)
    },

    // Analyze JSX fragments
    JSXFragment(path) {
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
      analyzeJSXForPropUsage(path as any, propNames, usageMap)
    },

    // Analyze identifiers (prop references in code)
    Identifier(path) {
      if (propNames.includes(path.node.name)) {
        const propName = path.node.name
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
        const context = getIdentifierContext(path as any)

        if (context && usageMap[propName]) {
          usageMap[propName].isUsed = true
          usageMap[propName].contexts.push(context)

          // Analyze dependencies
          // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
          const dependencies = findDependencies(path as any, propNames)
          dependencies.forEach((dep) => {
            if (!usageMap[propName]?.dependencies.includes(dep)) {
              usageMap[propName]?.dependencies.push(dep)
            }
          })
        }
      }
    },
  })

  return usageMap
}

/**
 * Analyze JSX elements and their attributes for prop usage
 */
const analyzeJSXForPropUsage = (
  path: NodePath<t.JSXElement | t.JSXFragment>,
  propNames: string[],
  usageMap: Record<string, PropUsageInfo>,
) => {
  if (t.isJSXElement(path.node)) {
    // Check JSX attributes
    path.node.openingElement.attributes.forEach((attr) => {
      if (t.isJSXAttribute(attr) && attr.value) {
        analyzeJSXAttributeValue(attr.value, propNames, usageMap, attr.name)
      } else if (t.isJSXSpreadAttribute(attr)) {
        // Handle spread attributes
        if (
          t.isIdentifier(attr.argument) &&
          propNames.includes(attr.argument.name)
        ) {
          const propName = attr.argument.name
          if (!usageMap[propName]) return
          usageMap[propName].isUsed = true
          usageMap[propName].contexts.push({
            location: 'template_spread',
            expression: `{...${propName}}`,
            type: 'binding',
          })
        }
      }
    })
  }

  // Check JSX children for text interpolation
  if (t.isJSXElement(path.node)) {
    path.node.children.forEach((child) => {
      if (t.isJSXExpressionContainer(child)) {
        analyzeJSXExpression(
          child.expression,
          propNames,
          usageMap,
          'template_children',
        )
      }
    })
  } else if (t.isJSXFragment(path.node)) {
    path.node.children.forEach((child) => {
      if (t.isJSXExpressionContainer(child)) {
        analyzeJSXExpression(
          child.expression,
          propNames,
          usageMap,
          'template_children',
        )
      }
    })
  }
}

/**
 * Analyze JSX attribute values for prop usage
 */
const analyzeJSXAttributeValue = (
  value: t.JSXAttribute['value'],
  propNames: string[],
  usageMap: Record<string, PropUsageInfo>,
  attributeName: t.JSXIdentifier | t.JSXNamespacedName,
) => {
  if (t.isJSXExpressionContainer(value)) {
    const attrName = t.isJSXIdentifier(attributeName)
      ? attributeName.name
      : 'unknown'
    analyzeJSXExpression(
      value.expression,
      propNames,
      usageMap,
      `template_attribute_${attrName}`,
    )
  }
}

/**
 * Analyze JSX expressions for prop usage
 */
const analyzeJSXExpression = (
  expression: t.Expression | t.JSXEmptyExpression,
  propNames: string[],
  usageMap: Record<string, PropUsageInfo>,
  location: string,
) => {
  if (t.isJSXEmptyExpression(expression)) return

  // Validate that we have a proper expression before creating expression statement
  if (!t.isExpression(expression)) return

  try {
    // Find prop references in the expression
    // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
    traverse(t.file(t.program([t.expressionStatement(expression)])) as any, {
      Identifier(idPath) {
        if (propNames.includes(idPath.node.name)) {
          const propName = idPath.node.name
          if (!usageMap[propName]) return
          usageMap[propName].isUsed = true

          // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
          const usageType = getExpressionUsageType(expression, idPath as any)
          usageMap[propName].contexts.push({
            location,
            // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
            expression: generate(expression as any).code,
            type: usageType,
          })
        }
      },
    })
  } catch (error) {
    // If traversal fails, skip this expression but continue analysis
    console.warn('Failed to analyze expression:', error)
  }
}

/**
 * Get the context information for an identifier usage
 */
const getIdentifierContext = (
  path: NodePath<t.Identifier>,
): PropUsageContext | null => {
  const parent = path.parent

  // Skip if it's a property key or parameter name
  if (t.isObjectProperty(parent) && parent.key === path.node) return null
  if (t.isFunctionDeclaration(parent) || t.isArrowFunctionExpression(parent))
    return null
  if (t.isVariableDeclarator(parent) && parent.id === path.node) return null

  // Determine usage type based on parent context
  if (t.isCallExpression(parent)) {
    if (parent.callee === path.node) {
      return {
        location: 'function_call',
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
        expression: generate(parent as any).code,
        type: 'reference',
      }
    } else {
      return {
        location: 'function_argument',
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
        expression: generate(parent as any).code,
        type: 'reference',
      }
    }
  }

  if (t.isConditionalExpression(parent)) {
    return {
      location: 'conditional_expression',
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
      expression: generate(parent as any).code,
      type: 'conditional',
    }
  }

  if (t.isLogicalExpression(parent)) {
    return {
      location: 'logical_expression',
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
      expression: generate(parent as any).code,
      type: 'conditional',
    }
  }

  if (t.isMemberExpression(parent) && parent.object === path.node) {
    return {
      location: 'member_access',
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
      expression: generate(parent as any).code,
      type: 'reference',
    }
  }

  if (t.isAssignmentExpression(parent)) {
    return {
      location: 'assignment',
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
      expression: generate(parent as any).code,
      type: 'reference',
    }
  }

  // Default case
  return {
    location: 'code_reference',
    // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
    expression: generate(path.node as any).code,
    type: 'reference',
  }
}

/**
 * Determine the type of usage for an expression
 */
const getExpressionUsageType = (
  expression: t.Expression,
  identifierPath: NodePath<t.Identifier>,
): PropUsageContext['type'] => {
  if (t.isConditionalExpression(expression)) return 'conditional'
  if (t.isLogicalExpression(expression)) return 'conditional'
  if (t.isCallExpression(expression)) return 'reference'
  if (t.isArrowFunctionExpression(expression)) return 'event'
  if (t.isFunctionExpression(expression)) return 'event'

  // Check if it's in a loop context
  // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
  let currentPath: any = identifierPath
  while (currentPath.parentPath) {
    const parent = currentPath.parent
    if (
      t.isForStatement(parent) ||
      t.isWhileStatement(parent) ||
      t.isForInStatement(parent) ||
      t.isForOfStatement(parent)
    ) {
      return 'iteration'
    }
    currentPath = currentPath.parentPath
  }

  return 'interpolation'
}

/**
 * Find dependencies (other props/state) that this prop usage depends on
 */
const findDependencies = (
  path: NodePath<t.Identifier>,
  propNames: string[],
): string[] => {
  const dependencies: string[] = []

  // Look for other prop references in the same expression
  // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
  let currentPath: any = path
  while (currentPath.parentPath && !t.isStatement(currentPath.parent)) {
    currentPath = currentPath.parentPath
  }

  if (currentPath.node) {
    try {
      const nodeToTraverse = t.isStatement(currentPath.node)
        ? currentPath.node
        : t.isExpression(currentPath.node)
          ? t.expressionStatement(currentPath.node)
          : null

      if (nodeToTraverse) {
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
        traverse(t.file(t.program([nodeToTraverse])) as any, {
          Identifier(idPath) {
            if (
              propNames.includes(idPath.node.name) &&
              idPath.node.name !== path.node.name &&
              !dependencies.includes(idPath.node.name)
            ) {
              dependencies.push(idPath.node.name)
            }
          },
        })
      }
    } catch (error) {
      // If traversal fails, return empty dependencies
      console.warn('Failed to find dependencies:', error)
    }
  }

  return dependencies
}
