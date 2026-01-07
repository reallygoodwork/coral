/**
 * Generate reverse CSS → Tailwind mappings from tw2css package
 *
 * This creates lookup tables for converting CSS property-value pairs
 * back to their Tailwind class equivalents.
 */

import { mappings as tw2cssMappings } from '@reallygoodwork/coral-tw2css'

export interface PropertyValueMapping {
  [property: string]: {
    [value: string]: string // value → tailwind class
  }
}

export interface PrefixMapping {
  [prefix: string]: string[] // e.g., 'p-' → ['paddingInlineStart', ...]
}

/**
 * Generate reverse mappings from tw2css
 * Maps CSS properties and values to Tailwind classes
 */
export function generateReverseMappings(): {
  propertyValue: PropertyValueMapping
  prefixes: PrefixMapping
} {
  const propertyValue: PropertyValueMapping = {}
  const prefixes: PrefixMapping = {}

  for (const [twClass, mapping] of Object.entries(tw2cssMappings)) {
    // Handle array of properties (like padding prefixes)
    if (Array.isArray(mapping)) {
      prefixes[twClass] = mapping as string[]
      continue
    }

    // Handle object mappings
    if (typeof mapping === 'object' && mapping !== null && !Array.isArray(mapping)) {
      // Single property-value pair
      if ('property' in mapping && 'value' in mapping) {
        const { property, value } = mapping as {
          property: string
          value: string | number | { value: number; unit: string }
        }

        // Initialize property map if needed
        if (!propertyValue[property]) {
          propertyValue[property] = {}
        }

        // Convert value to string for lookup
        const valueKey = typeof value === 'object' ? `${value.value}${value.unit}` : String(value)

        // Store the mapping
        propertyValue[property][valueKey] = twClass
      }
      // Nested array of property-value pairs
      else if ('0' in mapping) {
        const items = Object.values(mapping)
        for (const item of items) {
          if (
            typeof item === 'object' &&
            item !== null &&
            'property' in item &&
            'value' in item
          ) {
            const { property, value } = item as {
              property: string
              value: string | number | { value: number; unit: string }
            }

            if (!propertyValue[property]) {
              propertyValue[property] = {}
            }

            const valueKey =
              typeof value === 'object' ? `${value.value}${value.unit}` : String(value)
            propertyValue[property][valueKey] = twClass
          }
        }
      }
    }
  }

  return { propertyValue, prefixes }
}

// Generate and export the reverse mappings
const { propertyValue, prefixes } = generateReverseMappings()

export const reverseMappings = propertyValue
export const prefixMappings = prefixes
