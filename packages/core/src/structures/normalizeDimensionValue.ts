import type { Dimension, DimensionUnit } from './dimension'

/**
 * Helper function to normalize a dimension to the object format
 */
export function normalizeDimension(dimension: Dimension): {
  value: number
  unit: DimensionUnit
} {
  if (typeof dimension === 'number') {
    return { value: dimension, unit: 'px' }
  }
  return dimension
}
