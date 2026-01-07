// ============================================================================
// Existing exports (preserved for backward compatibility)
// ============================================================================

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
export type {
  CoralComponentPropertyType,
  CoralComponentPropertyWithMetadata,
} from './structures/componentProperties'
export type {
  ComponentMeta,
  CoralNode,
  CoralRootNode,
} from './structures/coral'
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

// ============================================================================
// New schema exports - Structures
// ============================================================================

export type {
  BindableValue,
  ComputedValue,
  EventBinding,
  EventReference,
  InlineHandler,
  PropTransform,
} from './structures/bindings'
// Bindings
export {
  applyTransform,
  extractValue,
  isBinding,
  isComputedValue,
  isEventReference,
  isInlineHandler,
  isPropTransform,
  isTokenRef,
  resolveComputed,
  zBindableValueSchema,
  zComputedValueSchema,
  zEventBindingSchema,
  zEventReferenceSchema,
  zInlineHandlerSchema,
  zPropTransformSchema,
  zTokenRefSchema,
} from './structures/bindings'
export type {
  Category,
  ComponentEntry,
  ComponentIndex,
} from './structures/componentIndex'
// Component Index
export {
  addComponentToIndex,
  createComponentIndex,
  findComponentEntry,
  getAllTags,
  getComponentsByCategory,
  getComponentsByStatus,
  getUniqueCategories,
  removeComponentFromIndex,
  searchComponentsByTag,
  zCategorySchema,
  zComponentEntrySchema,
  zComponentIndexSchema,
} from './structures/componentIndex'
export type {
  ComponentInstance,
  ComponentInstanceRef,
  ComponentSet,
  ComponentSetMember,
  PropBinding,
  SharedContextProperty,
} from './structures/composition'
// Composition
export {
  buildDependencyGraph,
  extractComponentName,
  findCircularDependencies,
  findComponentInstances,
  getInstanceDependencies,
  isComponentInstance,
  isPropBinding,
  toKebabCase,
  toPascalCase,
  zComponentInstanceRefSchema,
  zComponentInstanceSchema,
  zComponentSetMemberSchema,
  zComponentSetSchema,
  zPropBindingSchema,
  zSharedContextPropertySchema,
} from './structures/composition'
export type {
  ConditionalBehavior,
  ConditionalExpression,
  ConditionalStyle,
} from './structures/conditional'
// Conditional expressions
export {
  evaluateCondition,
  isConditionalExpression,
  zConditionalBehaviorSchema,
  zConditionalExpressionSchema,
  zConditionalStyleSchema,
} from './structures/conditional'
export type {
  ComponentEventDefinition,
  ComponentEventsDefinition,
  EventParameter,
} from './structures/events'
// Events
export {
  eventToTypeScript,
  generateEventJSDoc,
  getEventPropNames,
  isEventHandlerName,
  zComponentEventDefinitionSchema,
  zComponentEventsDefinitionSchema,
  zEventParameterSchema,
} from './structures/events'
export type {
  AssetsConfig,
  ComponentsConfig,
  CoralConfig,
  CoralSpec,
  ExportTarget,
  PresetsConfig,
  TokenContext,
  TokensConfig,
} from './structures/package'
// Package
export {
  createDefaultConfig,
  getDefaultExportTarget,
  parsePackageRef,
  resolveConfigPath,
  validateConfig,
  zAssetsConfigSchema,
  zComponentsConfigSchema,
  zCoralConfigSchema,
  zCoralSpecSchema,
  zExportTargetSchema,
  zPresetsConfigSchema,
  zTokenContextSchema,
  zTokensConfigSchema,
} from './structures/package'
export type {
  ComponentPropDefinition,
  ComponentPropsDefinition,
  EditorControl,
  PrimitivePropType,
  PropConstraints,
  PropType,
} from './structures/props'
// Props
export {
  getDefaultPropValues,
  getRequiredProps,
  propTypeToTypeScript,
  validatePropValue,
  zComponentPropDefinitionSchema,
  zComponentPropsDefinitionSchema,
  zEditorControlSchema,
  zPrimitivePropTypeSchema,
  zPropConstraintsSchema,
  zPropTypeSchema,
} from './structures/props'
export type {
  AnyReference,
  AssetReference,
  ComponentReference,
  ExternalReference,
  PropReference,
  TokenReference,
} from './structures/references'
// References
export {
  isAnyReference,
  isAssetReference,
  isComponentReference,
  isExternalReference,
  isPropReference,
  isTokenReference,
  zAnyReferenceSchema,
  zAssetReferenceSchema,
  zComponentReferenceSchema,
  zExternalReferenceSchema,
  zPropReferenceSchema,
  zTokenReferenceSchema,
} from './structures/references'
export type {
  SlotBinding,
  SlotDefinition,
  SlotForward,
} from './structures/slots'
// Slots
export {
  createDefaultSlotDefinition,
  findSlotDefinition,
  getRequiredSlots,
  isSlotForward,
  isSlotPropReference,
  isSlotTarget,
  validateSlotContent,
  zSlotBindingSchema,
  zSlotDefinitionSchema,
  zSlotForwardSchema,
} from './structures/slots'
export type {
  ContextDefinition,
  ContextDimension,
  TokenIndex,
  TokenSource,
} from './structures/tokenIndex'
// Token Index
export {
  addTokenSource,
  createDefaultTokenIndex,
  createTokenIndex,
  findContextDefinition,
  getContextNames,
  getDefaultContext,
  getOrderedSources,
  getSourcesByLayer,
  zContextDefinitionSchema,
  zContextDimensionSchema,
  zTokenIndexSchema,
  zTokenSourceSchema,
} from './structures/tokenIndex'
export type {
  CompoundVariantStyle,
  NodeVariantStyles,
  StateStyles,
  VariantValueStyles,
} from './structures/variantStyles'
// Variant styles
export {
  applyCompoundStyles,
  isVariantAwareStateStyles,
  mergeVariantStyles,
  zCompoundVariantStyleSchema,
  zNodeVariantStylesSchema,
  zStateStylesSchema,
  zVariantValueStylesSchema,
} from './structures/variantStyles'
export type {
  ComponentVariants,
  CompoundVariantCondition,
  VariantAxis,
} from './structures/variants'
// Variants
export {
  getDefaultVariantValues,
  getVariantCombinations,
  matchesCompoundCondition,
  validateVariantValues,
  zComponentVariantsSchema,
  zCompoundVariantConditionSchema,
  zVariantAxisSchema,
} from './structures/variants'

// ============================================================================
// New utility exports - Lib
// ============================================================================

export type { ResolvedInstance } from './lib/compositionUtils'
// Composition utilities
export {
  countComponentInstances,
  flattenComponentTree,
  getComponentDependencies,
  getComponentOrder,
  hasComponentInstances,
  resolveComponentInstance,
  validateComposition,
} from './lib/compositionUtils'
// Type generation
export {
  generateComponentJSDoc,
  generateComponentTypes,
  generatePackageTypes,
  generatePropsInterface,
  generateVariantDefaults,
  generateVariantTypes,
  propTypeToTS,
} from './lib/generateTypes'
export type {
  LoadedPackage,
  PackageLoaderOptions,
} from './lib/packageLoader'
// Package loader
export {
  getComponent,
  getComponentNames,
  hasComponent,
  loadPackage,
} from './lib/packageLoader'
export type {
  PackageData,
  PackageWriterOptions,
} from './lib/packageWriter'
// Package writer
export {
  createComponentScaffold,
  createTokenScaffold,
  writeComponent,
  writePackage,
  writeTokens,
} from './lib/packageWriter'
// Props resolution
export {
  collectReferencedEvents,
  collectReferencedProps,
  resolveAllEventBindings,
  resolveAllPropBindings,
  resolveEventBinding,
  resolvePropBinding,
} from './lib/resolveProps'
export type {
  ReferenceResolver,
  ReferenceResolverOptions,
} from './lib/resolveReferences'
// Reference resolution
export {
  collectPropReferences,
  collectTokenReferences,
  createReferenceResolver,
  resolveStyleReferences,
  resolveValue,
} from './lib/resolveReferences'
export type { VariantContext } from './lib/resolveVariantStyles'
// Variant styles resolution
export {
  generateVariantStyleMap,
  getAllNodeStyles,
  resolveNodeStyles,
  resolveStateStyles,
  resolveTreeStyles,
  variantsToClassName,
} from './lib/resolveVariantStyles'
export type {
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from './lib/validatePackage'
// Package validation
export { validatePackage } from './lib/validatePackage'
export type {
  PropValidationError,
  PropValidationResult,
  PropValidationWarning,
} from './lib/validateProps'
// Props validation
export {
  findUnusedProps,
  validateProps,
} from './lib/validateProps'
