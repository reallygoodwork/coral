export { dimensionToCSS } from './lib/convertDimensionsToCSSString'
export {
  extractMediaQueriesFromCSS,
  extractResponsiveStylesFromObject,
  mediaQueriesToResponsiveStyles,
  parseMediaQuery,
} from './lib/parseMediaQuery'
export { parseUISpec } from './lib/parseUISpec'
export { pascalCaseString } from './lib/pascalCaseString'
export { transformHTMLToSpec } from './lib/transformHTMLToSpec'
export type { CoralColorType } from './structures/color'
export type { CoralComponentPropertyType } from './structures/componentProperties'
export type { CoralNode, CoralRootNode } from './structures/coral'
export type { CoralDependencyType } from './structures/dependency'
export type { CoralDesignTokenType } from './structures/designToken'
export type { Dimension, DimensionUnit } from './structures/dimension'
export type { CoralGradientType } from './structures/gradient'
export type { CoralImportType } from './structures/import'
export type { CoralMethodType } from './structures/method'
export { normalizeDimension } from './structures/normalizeDimensionValue'
export type {
  Breakpoint,
  BreakpointType,
  CoralResponsiveStyles,
  RangeBreakpoint,
  ResponsiveStyle,
  SimpleBreakpoint,
} from './structures/responsiveBreakpoint'
export type { CoralStateType } from './structures/state'
export type { CoralStyleType } from './structures/styles'
export type { CoralTSTypes } from './structures/TSTypes'
export type { CoralElementType } from './structures/utilities'
export type { CoralVariantType } from './structures/variant'
