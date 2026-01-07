import type { CoralRootNode } from '@reallygoodwork/coral-core'
import { generateComponent } from './generateComponent'
import type { Options } from './types'

/**
 * Converts a Coral specification to React component code
 * @param spec - Coral root node specification
 * @param options - Generation options
 * @returns Object with reactCode and cssCode strings (or Promise if prettier option is enabled)
 */
export async function coralToReact(
  spec: CoralRootNode,
  options?: Options,
): Promise<{ reactCode: string; cssCode: string }> {
  return generateComponent(spec, options)
}

export { stylesToInlineStyle } from './convertStyles'
export { generateComponent } from './generateComponent'
export { generateCSS } from './generateCSS'
export { generateCVA, generateCNHelper } from './generateCVA'
export { generateImports } from './generateImports'
export { generateJSXElement } from './generateJSX'
export { generateMethod, generateMethods } from './generateMethod'
export { generatePackage } from './generatePackage'
export { generatePropsInterface } from './generatePropsInterface'
export { generateStateHook, generateStateHooks } from './generateStateHooks'
export type {
  GeneratedFile,
  Options,
  PackageGenerationResult,
} from './types'
export type { CVAConfig, CVAGenerationResult, GenerateCVAOptions } from './generateCVA'
