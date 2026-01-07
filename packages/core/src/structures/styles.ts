import * as z from 'zod'

import { zCoralColorSchema } from './color'
import { zDimensionSchema } from './dimension'
import { zCoralGradientTypeSchema } from './gradient'

export const zCoralStyleValueSchema = z
  .union([
    z.string(),
    z.number(),
    zCoralColorSchema,
    zCoralGradientTypeSchema,
    zDimensionSchema,
  ])
  .describe('The value of a style property')

// Create a lazy schema to support recursive nesting for media queries and pseudo-selectors
// Define the type first as an interface to allow recursive references
export interface CoralStyleType
  extends Record<
    string,
    | string
    | number
    | z.infer<typeof zCoralColorSchema>
    | z.infer<typeof zCoralGradientTypeSchema>
    | z.infer<typeof zDimensionSchema>
    | CoralStyleType
  > {}

export const zCoralStyleSchema: z.ZodType<CoralStyleType> = z.lazy(() =>
  z
    .record(
      z.string().describe('The name of a style property'),
      z.union([
        zCoralStyleValueSchema,
        z
          .record(
            z.string(),
            z.union([zCoralStyleValueSchema, zCoralStyleSchema]),
          )
          .describe('A nested style property'),
      ]),
    )
    .describe('The styles of the Coral Component'),
)
