import type { Dimension } from '../structures/dimension'

/**
 * Helper function to convert a dimension to a CSS string
 */
export function dimensionToCSS(dimension: Dimension): string {
  if (typeof dimension === 'number') {
    return `${dimension}px`
  }
  return `${dimension.value}${dimension.unit}`
}
