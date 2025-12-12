import type { Result } from './transformReactComponentToCoralSpec'

export const findImportSource = (componentName: string, result: Result): string | undefined => {
  const importInfo = result.imports?.find((imp) =>
    imp.specifiers.some((spec: { name: string }) => spec.name === componentName),
  )
  return importInfo ? importInfo.source : undefined
}
