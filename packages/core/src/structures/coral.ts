import * as z from 'zod'

import { zBindableValueSchema, zEventBindingSchema } from './bindings'
import { zCoralComponentPropertySchema } from './componentProperties'
import {
  zComponentInstanceRefSchema,
  zPropBindingSchema,
} from './composition'
import {
  zConditionalBehaviorSchema,
  zConditionalExpressionSchema,
  zConditionalStyleSchema,
} from './conditional'
import { zCoralDependencySchema } from './dependency'
import { zCoralDesignTokenSchema } from './designToken'
import { zComponentEventsDefinitionSchema } from './events'
import { zCoralImportSchema } from './import'
import { zCoralMethodSchema } from './method'
import { zComponentPropsDefinitionSchema } from './props'
import { zCoralResponsiveStylesSchema } from './responsiveBreakpoint'
import { zSlotBindingSchema, zSlotDefinitionSchema } from './slots'
import { zCoralStateSchema } from './state'
import { zCoralStyleSchema } from './styles'
import { zCoralTSTypes } from './TSTypes'
import { zCoralNameSchema, zElementSchema } from './utilities'
import {
  zCompoundVariantStyleSchema,
  zNodeVariantStylesSchema,
  zStateStylesSchema,
} from './variantStyles'
import { zComponentVariantsSchema } from './variants'

// ============================================================================
// Component Meta Schema (new)
// ============================================================================

/**
 * Enhanced component metadata
 */
export const zComponentMetaSchema = z
  .object({
    name: z.string().describe('Component name'),
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+(-[\w.]+)?$/)
      .optional()
      .describe('Component version (semver)'),
    status: z
      .enum(['draft', 'beta', 'stable', 'deprecated'])
      .optional()
      .describe('Component status'),
    description: z.string().optional().describe('Component description'),
    category: z.string().optional().describe('Component category'),
    tags: z.array(z.string()).optional().describe('Search tags'),
    author: z.string().optional().describe('Component author'),
    license: z.string().optional().describe('License'),
  })
  .describe('Component metadata')

export type ComponentMeta = z.infer<typeof zComponentMetaSchema>

// ============================================================================
// Node Schema (extended with new optional fields)
// ============================================================================

// Create a lazy schema to handle recursion properly
export const zCoralSchema: z.ZodType<CoralNode> = z.lazy(() =>
  z.object({
    // ========================================================================
    // Existing fields (preserved for backward compatibility)
    // ========================================================================
    componentParentFigmaNodeRef: z
      .string()
      .optional()
      .describe('The parent of the Coral Component'),
    description: z
      .string()
      .optional()
      .describe('The description of the Coral Component'),
    elementType: zElementSchema
      .describe('The type of the element to be created')
      .default('div'),
    figmaType: z
      .string()
      .optional()
      .describe('The type of the Figma node to be created'),
    elementAttributes: z
      .union([
        z.record(
          z.string(),
          z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
        ),
        z.undefined(),
      ])
      .optional()
      .describe('The attributes of the element to be created'),
    figmaNodeRef: z
      .string()
      .optional()
      .describe('The reference to the Figma node'),
    hasBackgroundImage: z
      .boolean()
      .optional()
      .describe('Whether the element has a background image'),
    isComponentInstance: z
      .boolean()
      .optional()
      .describe('Whether the element is a component instance'),
    name: zCoralNameSchema.describe('The name of the Coral Component'),
    options: z
      .record(z.string(), z.unknown())
      .nullish()
      .describe('The options of the variant'),
    styles: zCoralStyleSchema.optional(),
    responsiveStyles: zCoralResponsiveStylesSchema.describe(
      'Responsive styles for different breakpoints',
    ),
    textContent: z
      .union([z.string(), z.record(z.string(), z.unknown())])
      .optional()
      .describe('The text content of the element (static or prop reference)'),
    tsType: z
      .string()
      .optional()
      .describe('The TypeScript type of the Coral Component'),
    type: z
      .union([
        z.literal('COMPONENT'),
        z.literal('INSTANCE'),
        z.literal('COMPONENT_SET'),
        z.literal('NODE'),
        z.literal('COMPONENT_INSTANCE'), // New type for component instances
      ])
      .default('NODE')
      .optional()
      .describe(
        'The type of the Coral Component. Also used to determine the type of the node to be created in Figma',
      ),
    variantProperties: z
      .record(
        zCoralNameSchema,
        z.object({
          type: z.union([
            zCoralTSTypes,
            z
              .array(zCoralTSTypes)
              .describe('An array of types used as or'),
          ]),
          value: z.unknown().describe('The value of the variant property'),
        }),
      )
      .optional()
      .describe(
        'The variant properties of the Coral Component variant. Connects to the component properties of the Component Set or Component',
      ),
    children: z
      .array(zCoralSchema)
      .nullish()
      .describe('The children of the Coral Component'),
    variants: z
      .array(zCoralSchema)
      .nullish()
      .describe('The variants of the Coral Component'),

    // ========================================================================
    // New fields for variants system
    // ========================================================================

    /** Per-node variant style responses */
    variantStyles: zNodeVariantStylesSchema
      .optional()
      .describe('Styles for different variant values'),

    /** Compound variant styles (when multiple variants match) */
    compoundVariantStyles: z
      .array(zCompoundVariantStyleSchema)
      .optional()
      .describe('Styles for compound variant conditions'),

    /** State styles (hover, focus, disabled, etc.) */
    stateStyles: zStateStylesSchema
      .optional()
      .describe('State-specific styles'),

    // ========================================================================
    // New fields for conditional rendering
    // ========================================================================

    /** Conditional rendering expression */
    conditional: zConditionalExpressionSchema
      .optional()
      .describe('Condition for rendering this node'),

    /** Behavior when conditional is false */
    conditionalBehavior: zConditionalBehaviorSchema
      .optional()
      .describe('How to handle when conditional is false'),

    /** Styles based on prop conditions */
    conditionalStyles: z
      .array(zConditionalStyleSchema)
      .optional()
      .describe('Conditional style overrides'),

    // ========================================================================
    // New fields for slots
    // ========================================================================

    /** This node is a slot target */
    slotTarget: z
      .string()
      .optional()
      .describe('Slot name this node renders content for'),

    /** Fallback content when slot is empty */
    slotFallback: z
      .array(zCoralSchema)
      .optional()
      .describe('Fallback content when slot is empty'),

    // ========================================================================
    // New fields for component instances
    // ========================================================================

    /** Reference to another component (for COMPONENT_INSTANCE type) */
    $component: zComponentInstanceRefSchema
      .optional()
      .describe('Component reference (for instances)'),

    /** Props to pass to component instance */
    propBindings: z
      .record(z.string(), zPropBindingSchema)
      .optional()
      .describe('Prop bindings for component instance'),

    /** Event bindings for component instance */
    eventBindings: z
      .record(z.string(), zEventBindingSchema)
      .optional()
      .describe('Event bindings for component instance'),

    /** Slot bindings for component instance */
    slotBindings: z
      .record(z.string(), zSlotBindingSchema)
      .optional()
      .describe('Slot bindings for component instance'),

    /** Variant overrides for component instance */
    variantOverrides: z
      .record(z.string(), z.string())
      .optional()
      .describe('Variant overrides for component instance'),

    /** Style overrides for component instance root */
    styleOverrides: zCoralStyleSchema
      .optional()
      .describe('Style overrides for component instance'),

    // ========================================================================
    // New fields for element bindings
    // ========================================================================

    /** Event handlers bound to component events */
    eventHandlers: z
      .record(z.string(), zEventBindingSchema)
      .optional()
      .describe('Event handlers for this element'),

    /** ARIA attributes (can include bindings) */
    ariaAttributes: z
      .record(z.string(), zBindableValueSchema)
      .optional()
      .describe('ARIA accessibility attributes'),

    /** Data attributes */
    dataAttributes: z
      .record(z.string(), zBindableValueSchema)
      .optional()
      .describe('Data attributes'),
  }),
)

// ============================================================================
// Root Schema (extended with new optional fields)
// ============================================================================

export const zCoralRootSchema = zCoralSchema.and(
  z.object({
    // ========================================================================
    // Existing fields (preserved)
    // ========================================================================
    $schema: z
      .literal('https://coral.design/schema.json')
      .optional()
      .describe('The schema of the Coral Component'),
    componentName: zCoralNameSchema
      .optional()
      .describe(
        'The name of the Coral Component. Will override the name of the Coral Component if provided.',
      ),
    componentProperties: zCoralComponentPropertySchema
      .optional()
      .describe('The component properties of the Coral Component'),
    config: z
      .record(z.string(), z.unknown())
      .nullish()
      .describe(
        'The configuration of the Coral Component. Can be used to pass additional data to the component',
      ),
    dependencies: z
      .array(zCoralDependencySchema)
      .optional()
      .describe('The dependencies of the Coral Component'),
    designTokens: z
      .record(zCoralNameSchema, zCoralDesignTokenSchema)
      .optional()
      .describe('The design tokens of the Coral Component'),
    imports: z
      .array(zCoralImportSchema)
      .optional()
      .describe('The imports of the Coral Component'),
    isComponentSet: z
      .boolean()
      .optional()
      .describe('Whether the element is a component set'),
    methods: z
      .array(zCoralMethodSchema)
      .optional()
      .describe('The methods of the Coral Component'),
    stateHooks: z
      .array(zCoralStateSchema)
      .optional()
      .describe('The state hooks of the Coral Component'),
    numberOfVariants: z
      .number()
      .optional()
      .describe('The number of instances of the Coral Component'),

    // ========================================================================
    // New fields for enhanced component definition
    // ========================================================================

    /** Enhanced component metadata */
    $meta: zComponentMetaSchema
      .optional()
      .describe('Enhanced component metadata'),

    /** Component-level variant definitions */
    componentVariants: zComponentVariantsSchema
      .optional()
      .describe('Component-level variant definitions'),

    /** Typed props definition (extends componentProperties) */
    props: zComponentPropsDefinitionSchema
      .optional()
      .describe('Typed props definitions'),

    /** Typed events definition */
    events: zComponentEventsDefinitionSchema
      .optional()
      .describe('Component events'),

    /** Slot definitions */
    slots: z
      .array(zSlotDefinitionSchema)
      .optional()
      .describe('Component slot definitions'),
  }),
)

// ============================================================================
// Types (extended with new fields)
// ============================================================================

import type { BindableValue, EventBinding } from './bindings'
import type { ComponentInstanceRef, PropBinding } from './composition'
import type { ConditionalBehavior, ConditionalExpression, ConditionalStyle } from './conditional'
import type { ComponentEventsDefinition } from './events'
import type { ComponentPropsDefinition } from './props'
import type { SlotBinding, SlotDefinition } from './slots'
import type { CompoundVariantStyle, NodeVariantStyles, StateStyles } from './variantStyles'
import type { ComponentVariants } from './variants'

// Forward declare the type for recursive reference
export type CoralNode = {
  // Existing fields
  componentParentFigmaNodeRef?: string
  description?: string
  elementType: z.infer<typeof zElementSchema>
  figmaType?: string
  elementAttributes?: Record<string, string | number | boolean | string[]>
  figmaNodeRef?: string
  hasBackgroundImage?: boolean
  isComponentInstance?: boolean
  name: string
  options?: Record<string, unknown> | null
  styles?: z.infer<typeof zCoralStyleSchema>
  responsiveStyles?: z.infer<typeof zCoralResponsiveStylesSchema>
  textContent?: string | Record<string, unknown>
  tsType?: string
  type?: 'COMPONENT' | 'INSTANCE' | 'COMPONENT_SET' | 'NODE' | 'COMPONENT_INSTANCE'
  variantProperties?: Record<
    string,
    {
      type: z.infer<typeof zCoralTSTypes> | z.infer<typeof zCoralTSTypes>[]
      value: unknown
    }
  >
  children?: CoralNode[] | null
  variants?: CoralNode[] | null

  // New variant fields
  variantStyles?: NodeVariantStyles
  compoundVariantStyles?: CompoundVariantStyle[]
  stateStyles?: StateStyles

  // New conditional fields
  conditional?: ConditionalExpression
  conditionalBehavior?: ConditionalBehavior
  conditionalStyles?: ConditionalStyle[]

  // New slot fields
  slotTarget?: string
  slotFallback?: CoralNode[]

  // New component instance fields
  $component?: ComponentInstanceRef
  propBindings?: Record<string, PropBinding>
  eventBindings?: Record<string, EventBinding>
  slotBindings?: Record<string, SlotBinding>
  variantOverrides?: Record<string, string>
  styleOverrides?: z.infer<typeof zCoralStyleSchema>

  // New element binding fields
  eventHandlers?: Record<string, EventBinding>
  ariaAttributes?: Record<string, BindableValue>
  dataAttributes?: Record<string, BindableValue>
}

export type CoralRootNode = CoralNode & {
  // Existing fields
  $schema?: 'https://coral.design/schema.json'
  componentName?: string
  componentProperties?: z.infer<typeof zCoralComponentPropertySchema>
  config?: Record<string, unknown> | null
  dependencies?: z.infer<typeof zCoralDependencySchema>[]
  designTokens?: Record<string, z.infer<typeof zCoralDesignTokenSchema>>
  imports?: z.infer<typeof zCoralImportSchema>[]
  isComponentSet?: boolean
  methods?: z.infer<typeof zCoralMethodSchema>[]
  stateHooks?: z.infer<typeof zCoralStateSchema>[]
  numberOfVariants?: number

  // New fields
  $meta?: ComponentMeta
  componentVariants?: ComponentVariants
  props?: ComponentPropsDefinition
  events?: ComponentEventsDefinition
  slots?: SlotDefinition[]
}
