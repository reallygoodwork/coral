import type { NodePath } from '@babel/traverse'

import type { CoralStateType } from '@reallygoodwork/coral-core'

export const analyzeStateInteractions = (
  path: NodePath,
  stateHooks: Array<CoralStateType>,
) => {
  const interactions = {
    reads: new Set<string>(),
    writes: new Set<string>(),
  }

  path.traverse({
    Identifier(identifierPath) {
      const stateHook = stateHooks.find(
        (hook) =>
          hook.name === identifierPath.node.name ||
          hook.setterName === identifierPath.node.name,
      )
      if (stateHook) {
        const isWrite =
          identifierPath.parentPath?.isCallExpression() &&
          identifierPath.parentPath.get('callee') === identifierPath

        if (isWrite) {
          interactions.writes.add(stateHook.name)
        } else {
          interactions.reads.add(stateHook.name)
        }
      }
    },
  })

  return {
    reads: Array.from(interactions.reads),
    writes: Array.from(interactions.writes),
  }
}
