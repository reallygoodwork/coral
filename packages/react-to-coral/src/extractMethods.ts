import generate from '@babel/generator'
import type { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import type {
  CoralMethodType,
  CoralStateType,
} from '@reallygoodwork/coral-core'
import { analyzeStateInteractions } from './analyzeStateInteractions'
import { getParamName } from './getParamName'

export const extractMethods = (
  path: NodePath<t.VariableDeclarator>,
  result: {
    methods?: Array<CoralMethodType>
    stateHooks?: Array<CoralStateType>
  },
) => {
  if (
    t.isArrowFunctionExpression(path.node.init) ||
    t.isFunctionExpression(path.node.init)
  ) {
    if (t.isIdentifier(path.node.id)) {
      const methodName = path.node.id.name
      const parameters = path.node.init.params.map(getParamName)
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
      const body = generate(path.node.init.body as any).code
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
      const initPath = path.get('init') as any
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
      const initBodyPath = initPath.get('body') as any
      const stateInteractions = analyzeStateInteractions(
        initBodyPath,
        result.stateHooks || [],
      )

      if (!result.methods?.some((m) => m.name === methodName)) {
        if (!result.methods) result.methods = []
        result.methods.push({
          name: methodName,
          parameters,
          body,
          stateInteractions,
        })
      }
    }
  }
}
