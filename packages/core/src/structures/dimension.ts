import * as z from 'zod'

export const zDimensionUnitSchema = z.enum([
  'px',
  'em',
  'rem',
  'vw',
  'vh',
  'vmin',
  'vmax',
  '%',
  'ch',
  'ex',
  'cm',
  'mm',
  'in',
  'pt',
  'pc',
])

export type DimensionUnit = z.infer<typeof zDimensionUnitSchema>

/**
 * Dimension value with unit
 * Can be either:
 * - A number (interpreted as pixels)
 * - An object with value and unit properties
 */
export const zDimensionSchema = z
  .union([
    z.number().describe('A dimension value in pixels'),
    z
      .object({
        value: z.number().describe('The numeric value of the dimension'),
        unit: zDimensionUnitSchema.describe('The unit of measurement'),
      })
      .describe('A dimension value with explicit unit'),
  ])
  .describe('A dimension value with unit')

export type Dimension = z.infer<typeof zDimensionSchema>
