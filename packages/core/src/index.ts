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
export type { CoralComponentPropertyType } from './structures/componentProperties'
export type { CoralNode, CoralRootNode, ComponentMeta } from './structures/coral'
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

// References
export {
  zTokenReferenceSchema,
  zPropReferenceSchema,
  zComponentReferenceSchema,
  zAssetReferenceSchema,
  zExternalReferenceSchema,
  zAnyReferenceSchema,
  isTokenReference,
  isPropReference,
  isComponentReference,
  isAssetReference,
  isExternalReference,
  isAnyReference,
} from './structures/references'
export type {
  TokenReference,
  PropReference,
  ComponentReference,
  AssetReference,
  ExternalReference,
  AnyReference,
} from './structures/references'

// Conditional expressions
export {
  zConditionalExpressionSchema,
  zConditionalBehaviorSchema,
  zConditionalStyleSchema,
  evaluateCondition,
  isConditionalExpression,
} from './structures/conditional'
export type {
  ConditionalExpression,
  ConditionalBehavior,
  ConditionalStyle,
} from './structures/conditional'

// Variants
export {
  zVariantAxisSchema,
  zCompoundVariantConditionSchema,
  zComponentVariantsSchema,
  getVariantCombinations,
  getDefaultVariantValues,
  validateVariantValues,
  matchesCompoundCondition,
} from './structures/variants'
export type {
  VariantAxis,
  CompoundVariantCondition,
  ComponentVariants,
} from './structures/variants'

// Variant styles
export {
  zVariantValueStylesSchema,
  zNodeVariantStylesSchema,
  zCompoundVariantStyleSchema,
  zStateStylesSchema,
  isVariantAwareStateStyles,
  mergeVariantStyles,
  applyCompoundStyles,
} from './structures/variantStyles'
export type {
  VariantValueStyles,
  NodeVariantStyles,
  CompoundVariantStyle,
  StateStyles,
} from './structures/variantStyles'

// Props
export {
  zPrimitivePropTypeSchema,
  zPropTypeSchema,
  zPropConstraintsSchema,
  zEditorControlSchema,
  zComponentPropDefinitionSchema,
  zComponentPropsDefinitionSchema,
  propTypeToTypeScript,
  getRequiredProps,
  getDefaultPropValues,
  validatePropValue,
} from './structures/props'
export type {
  PrimitivePropType,
  PropType,
  PropConstraints,
  EditorControl,
  ComponentPropDefinition,
  ComponentPropsDefinition,
} from './structures/props'

// Events
export {
  zEventParameterSchema,
  zComponentEventDefinitionSchema,
  zComponentEventsDefinitionSchema,
  eventToTypeScript,
  getEventPropNames,
  isEventHandlerName,
  generateEventJSDoc,
} from './structures/events'
export type {
  EventParameter,
  ComponentEventDefinition,
  ComponentEventsDefinition,
} from './structures/events'

// Bindings
export {
  zPropTransformSchema,
  zEventReferenceSchema,
  zComputedValueSchema,
  zTokenRefSchema,
  zBindableValueSchema,
  zInlineHandlerSchema,
  zEventBindingSchema,
  isPropTransform,
  isEventReference,
  isComputedValue,
  isTokenRef,
  isInlineHandler,
  isBinding,
  applyTransform,
  resolveComputed,
  extractValue,
} from './structures/bindings'
export type {
  PropTransform,
  EventReference,
  ComputedValue,
  BindableValue,
  InlineHandler,
  EventBinding,
} from './structures/bindings'

// Slots
export {
  zSlotDefinitionSchema,
  zSlotForwardSchema,
  zSlotBindingSchema,
  isSlotForward,
  isSlotPropReference,
  getRequiredSlots,
  validateSlotContent,
  createDefaultSlotDefinition,
  findSlotDefinition,
  isSlotTarget,
} from './structures/slots'
export type {
  SlotDefinition,
  SlotForward,
  SlotBinding,
} from './structures/slots'

// Composition
export {
  zComponentInstanceRefSchema,
  zPropBindingSchema,
  zComponentInstanceSchema,
  zComponentSetMemberSchema,
  zSharedContextPropertySchema,
  zComponentSetSchema,
  isComponentInstance,
  isPropBinding,
  extractComponentName,
  toPascalCase,
  toKebabCase,
  getInstanceDependencies,
  findComponentInstances,
  buildDependencyGraph,
  findCircularDependencies,
} from './structures/composition'
export type {
  ComponentInstanceRef,
  PropBinding,
  ComponentInstance,
  ComponentSetMember,
  SharedContextProperty,
  ComponentSet,
} from './structures/composition'

// Package
export {
  zTokenContextSchema,
  zTokensConfigSchema,
  zComponentsConfigSchema,
  zAssetsConfigSchema,
  zPresetsConfigSchema,
  zExportTargetSchema,
  zCoralSpecSchema,
  zCoralConfigSchema,
  parsePackageRef,
  createDefaultConfig,
  validateConfig,
  getDefaultExportTarget,
  resolveConfigPath,
} from './structures/package'
export type {
  TokenContext,
  TokensConfig,
  ComponentsConfig,
  AssetsConfig,
  PresetsConfig,
  ExportTarget,
  CoralSpec,
  CoralConfig,
} from './structures/package'

// Component Index
export {
  zComponentEntrySchema,
  zCategorySchema,
  zComponentIndexSchema,
  createComponentIndex,
  addComponentToIndex,
  removeComponentFromIndex,
  findComponentEntry,
  getComponentsByCategory,
  getComponentsByStatus,
  searchComponentsByTag,
  getUniqueCategories,
  getAllTags,
} from './structures/componentIndex'
export type {
  ComponentEntry,
  Category,
  ComponentIndex,
} from './structures/componentIndex'

// Token Index
export {
  zTokenSourceSchema,
  zContextDimensionSchema,
  zContextDefinitionSchema,
  zTokenIndexSchema,
  createTokenIndex,
  addTokenSource,
  getSourcesByLayer,
  getOrderedSources,
  getDefaultContext,
  getContextNames,
  findContextDefinition,
  createDefaultTokenIndex,
} from './structures/tokenIndex'
export type {
  TokenSource,
  ContextDimension,
  ContextDefinition,
  TokenIndex,
} from './structures/tokenIndex'

// ============================================================================
// New utility exports - Lib
// ============================================================================

// Package loader
export {
  loadPackage,
  getComponent,
  getComponentNames,
  hasComponent,
} from './lib/packageLoader'
export type {
  LoadedPackage,
  PackageLoaderOptions,
} from './lib/packageLoader'

// Package writer
export {
  writePackage,
  writeComponent,
  writeTokens,
  createComponentScaffold,
  createTokenScaffold,
} from './lib/packageWriter'
export type {
  PackageWriterOptions,
  PackageData,
} from './lib/packageWriter'

// Package validation
export {
  validatePackage,
} from './lib/validatePackage'
export type {
  ValidationError,
  ValidationWarning,
  ValidationResult,
} from './lib/validatePackage'

// Props validation
export {
  validateProps,
  findUnusedProps,
} from './lib/validateProps'
export type {
  PropValidationError,
  PropValidationWarning,
  PropValidationResult,
} from './lib/validateProps'

// Variant styles resolution
export {
  resolveNodeStyles,
  resolveTreeStyles,
  resolveStateStyles,
  getAllNodeStyles,
  generateVariantStyleMap,
  variantsToClassName,
} from './lib/resolveVariantStyles'
export type {
  VariantContext,
} from './lib/resolveVariantStyles'

// Reference resolution
export {
  createReferenceResolver,
  resolveStyleReferences,
  resolveValue,
  collectTokenReferences,
  collectPropReferences,
} from './lib/resolveReferences'
export type {
  ReferenceResolver,
  ReferenceResolverOptions,
} from './lib/resolveReferences'

// Props resolution
export {
  resolvePropBinding,
  resolveEventBinding,
  resolveAllPropBindings,
  resolveAllEventBindings,
  collectReferencedProps,
  collectReferencedEvents,
} from './lib/resolveProps'

// Composition utilities
export {
  resolveComponentInstance,
  flattenComponentTree,
  getComponentDependencies,
  validateComposition,
  getComponentOrder,
  hasComponentInstances,
  countComponentInstances,
} from './lib/compositionUtils'
export type {
  ResolvedInstance,
} from './lib/compositionUtils'

// Type generation
export {
  generatePropsInterface,
  propTypeToTS,
  generateComponentTypes,
  generatePackageTypes,
  generateComponentJSDoc,
  generateVariantTypes,
  generateVariantDefaults,
} from './lib/generateTypes'
