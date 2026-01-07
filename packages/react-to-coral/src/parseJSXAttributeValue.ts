import generate from '@babel/generator'
import * as t from '@babel/types'
import type {
  CoralComponentPropertyType,
  CoralMethodType,
  CoralStateType,
} from '@reallygoodwork/coral-core'
import { createPropReference } from './createPropReference'
import type { PropReference } from './transformReactComponentToCoralSpec'

export const parseJSXAttributeValue = (
  value: t.JSXAttribute['value'],
  result: {
    methods: Array<CoralMethodType>
    stateHooks: Array<CoralStateType>
    componentProperties: Array<CoralComponentPropertyType>
  },
): string | PropReference | null => {
  if (t.isStringLiteral(value)) {
    return value.value
  } else if (t.isJSXExpressionContainer(value)) {
    return parseJSXExpression(value.expression, result)
  }
  return null
}

const parseJSXExpression = (
  expression: t.Expression | t.JSXEmptyExpression,
  result: {
    methods: Array<CoralMethodType>
    stateHooks: Array<CoralStateType>
    componentProperties: Array<CoralComponentPropertyType>
  },
): string | PropReference | null => {
  // Handle JSX empty expressions (like {/* comment */})
  if (t.isJSXEmptyExpression(expression)) {
    return null
  }

  // Simple identifier - check if it's a prop, state, or method reference
  if (t.isIdentifier(expression)) {
    return createPropReference(expression.name, result)
  }

  // Numeric literals
  if (t.isNumericLiteral(expression)) {
    return expression.value.toString()
  }

  // Boolean literals
  if (t.isBooleanLiteral(expression)) {
    return expression.value.toString()
  }

  // Null literal
  if (t.isNullLiteral(expression)) {
    return 'null'
  }

  // String literals within expressions
  if (t.isStringLiteral(expression)) {
    return expression.value
  }

  // Template literals
  if (t.isTemplateLiteral(expression)) {
    return `\`${generate(expression as unknown as t.Node).code.slice(1, -1)}\``
  }

  // Array expressions
  if (t.isArrayExpression(expression)) {
    const elements = expression.elements.map((el) => {
      if (!el) return 'undefined'
      if (t.isSpreadElement(el)) {
        return `...${generate(el.argument as unknown as t.Node).code}`
      }
      return generate(el as unknown as t.Node).code
    })
    return `[${elements.join(', ')}]`
  }

  // Object expressions
  if (t.isObjectExpression(expression)) {
    const properties = expression.properties.map((prop) => {
      if (t.isSpreadElement(prop)) {
        return `...${generate(prop.argument as unknown as t.Node).code}`
      }
      return generate(prop as unknown as t.Node).code
    })
    return `{${properties.join(', ')}}`
  }

  // Arrow functions
  if (t.isArrowFunctionExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Function expressions
  if (t.isFunctionExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Call expressions
  if (t.isCallExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Member expressions (e.g., obj.prop, obj[key])
  if (t.isMemberExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Logical expressions (&&, ||)
  if (t.isLogicalExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Binary expressions (+, -, *, /, etc.)
  if (t.isBinaryExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Unary expressions (!, -, +, etc.)
  if (t.isUnaryExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Conditional expressions (ternary)
  if (t.isConditionalExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Assignment expressions
  if (t.isAssignmentExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Update expressions (++, --)
  if (t.isUpdateExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // Sequence expressions (comma operator)
  if (t.isSequenceExpression(expression)) {
    return `{${generate(expression as unknown as t.Node).code}}`
  }

  // For any other expression types, fall back to code generation
  // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
  return `{${generate(expression as any).code}}`
}
