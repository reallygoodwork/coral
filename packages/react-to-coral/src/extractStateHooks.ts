import generate from '@babel/generator'
import type { NodePath } from '@babel/traverse'
import * as t from '@babel/types'

import type { CoralStateType, CoralTSTypes } from '@reallygoodwork/coral-core'

export const extractStateHooks = (
  path: NodePath<t.CallExpression>,
  result: { stateHooks?: Array<CoralStateType> },
) => {
  if (t.isIdentifier(path.node.callee)) {
    const hookName = path.node.callee.name

    if (hookName === 'useState') {
      extractUseState(path, result)
    } else if (hookName === 'useEffect') {
      extractUseEffect(path, result)
    } else if (hookName === 'useReducer') {
      extractUseReducer(path, result)
    } else if (hookName === 'useContext') {
      extractUseContext(path, result)
    } else if (hookName === 'useMemo') {
      extractUseMemo(path, result)
    } else if (hookName === 'useCallback') {
      extractUseCallback(path, result)
    }
  }
}

const extractUseState = (
  path: NodePath<t.CallExpression>,
  result: { stateHooks?: Array<CoralStateType> },
) => {
  const parentPath = path.parentPath
  if (
    parentPath &&
    t.isVariableDeclarator(parentPath.node) &&
    t.isArrayPattern(parentPath.node.id)
  ) {
    const [stateName, stateSetterName] = parentPath.node.id.elements.map(
      (el) => (el && t.isIdentifier(el) ? el.name : 'unknown'),
    )
    const arg = path.node.arguments[0]
    let initialValue: unknown = null
    let type: CoralTSTypes = null

    if (arg) {
      if (t.isNumericLiteral(arg)) {
        initialValue = arg.value
        type = 'number'
      } else if (t.isStringLiteral(arg)) {
        initialValue = arg.value
        type = 'string'
      } else if (t.isBooleanLiteral(arg)) {
        initialValue = arg.value
        type = 'boolean'
      } else if (t.isArrayExpression(arg)) {
        type = 'array'
      } else if (t.isObjectExpression(arg)) {
        type = 'object'
      } else if (
        t.isArrowFunctionExpression(arg) ||
        t.isFunctionExpression(arg)
      ) {
        type = 'function'
      } else if (t.isNullLiteral(arg)) {
        initialValue = null
        type = 'null'
      } else if (t.isIdentifier(arg) && arg.name === 'undefined') {
        initialValue = undefined
        type = 'undefined'
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
        initialValue = generate(arg as any).code
        type = null
      }
    }

    if (
      stateName &&
      stateName !== 'unknown' &&
      stateSetterName &&
      stateSetterName !== 'unknown'
    ) {
      if (!result.stateHooks) result.stateHooks = []
      result.stateHooks.push({
        name: stateName,
        setterName: stateSetterName,
        initialValue,
        tsType: type,
        hookType: 'useState',
      })
    }
  }
}

const extractUseEffect = (
  path: NodePath<t.CallExpression>,
  result: { stateHooks?: Array<CoralStateType> },
) => {
  const parentPath = path.parentPath
  if (parentPath && t.isExpressionStatement(parentPath.node)) {
    const args = path.node.arguments
    if (args.length > 0) {
      const effectCallback = args[0]
      const dependencies = args[1]

      if (!result.stateHooks) result.stateHooks = []
      result.stateHooks.push({
        name: 'useEffect',
        setterName: '',
        initialValue: effectCallback
          // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
          ? generate(effectCallback as any).code
          : undefined,
        tsType: 'function',
        hookType: 'useEffect',
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
        dependencies: dependencies ? generate(dependencies as any).code : undefined,
      })
    }
  }
}

const extractUseReducer = (
  path: NodePath<t.CallExpression>,
  result: { stateHooks?: Array<CoralStateType> },
) => {
  const parentPath = path.parentPath
  if (
    parentPath &&
    t.isVariableDeclarator(parentPath.node) &&
    t.isArrayPattern(parentPath.node.id)
  ) {
    const [stateName, dispatchName] = parentPath.node.id.elements.map((el) =>
      el && t.isIdentifier(el) ? el.name : 'unknown',
    )

    const args = path.node.arguments
    const reducer = args[0]
    const initialState = args[1]

    if (
      stateName &&
      stateName !== 'unknown' &&
      dispatchName &&
      dispatchName !== 'unknown'
    ) {
      if (!result.stateHooks) result.stateHooks = []
      result.stateHooks.push({
        name: stateName,
        setterName: dispatchName,
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
        initialValue: initialState ? generate(initialState as any).code : undefined,
        tsType: null,
        hookType: 'useReducer',
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
        reducer: reducer ? generate(reducer as any).code : undefined,
      })
    }
  }
}

const extractUseContext = (
  path: NodePath<t.CallExpression>,
  result: { stateHooks?: Array<CoralStateType> },
) => {
  const parentPath = path.parentPath
  if (
    parentPath &&
    t.isVariableDeclarator(parentPath.node) &&
    t.isIdentifier(parentPath.node.id)
  ) {
    const contextName = parentPath.node.id.name
    const contextArg = path.node.arguments[0]

    if (!result.stateHooks) result.stateHooks = []
    result.stateHooks.push({
      name: contextName,
      setterName: '',
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
      initialValue: contextArg ? generate(contextArg as any).code : undefined,
      tsType: null,
      hookType: 'useContext',
    })
  }
}

const extractUseMemo = (
  path: NodePath<t.CallExpression>,
  result: { stateHooks?: Array<CoralStateType> },
) => {
  const parentPath = path.parentPath
  if (
    parentPath &&
    t.isVariableDeclarator(parentPath.node) &&
    t.isIdentifier(parentPath.node.id)
  ) {
    const memoName = parentPath.node.id.name
    const args = path.node.arguments
    const memoCallback = args[0]
    const dependencies = args[1]

    if (!result.stateHooks) result.stateHooks = []
    result.stateHooks.push({
      name: memoName,
      setterName: '',
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
      initialValue: memoCallback ? generate(memoCallback as any).code : undefined,
      tsType: null,
      hookType: 'useMemo',
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
      dependencies: dependencies ? generate(dependencies as any).code : undefined,
    })
  }
}

const extractUseCallback = (
  path: NodePath<t.CallExpression>,
  result: { stateHooks?: Array<CoralStateType> },
) => {
  const parentPath = path.parentPath
  if (
    parentPath &&
    t.isVariableDeclarator(parentPath.node) &&
    t.isIdentifier(parentPath.node.id)
  ) {
    const callbackName = parentPath.node.id.name
    const args = path.node.arguments
    const callback = args[0]
    const dependencies = args[1]

    if (!result.stateHooks) result.stateHooks = []
    result.stateHooks.push({
      name: callbackName,
      setterName: '',
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
      initialValue: callback ? generate(callback as any).code : undefined,
      tsType: 'function',
      hookType: 'useCallback',
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/generator and @babel/types versions
      dependencies: dependencies ? generate(dependencies as any).code : undefined,
    })
  }
}
