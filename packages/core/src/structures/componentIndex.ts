import * as z from 'zod'

/**
 * Component entry in the index
 *
 * @example
 * ```json
 * {
 *   "name": "Button",
 *   "path": "./button/button.coral.json",
 *   "category": "Actions",
 *   "status": "stable",
 *   "tags": ["interactive", "form"]
 * }
 * ```
 */
export const zComponentEntrySchema = z
  .object({
    /** Component name */
    name: z.string().describe('Component name'),

    /** Path to component file (relative to index) */
    path: z.string().describe('Path to component file'),

    /** Category for organization */
    category: z.string().optional().describe('Component category'),

    /** Component status */
    status: z
      .enum(['draft', 'beta', 'stable', 'deprecated'])
      .optional()
      .describe('Component status'),

    /** Tags for search/filtering */
    tags: z.array(z.string()).optional().describe('Search tags'),
  })
  .describe('Component index entry')

export type ComponentEntry = z.infer<typeof zComponentEntrySchema>

/**
 * Category definition
 */
export const zCategorySchema = z
  .object({
    name: z.string().describe('Category name'),
    description: z.string().optional().describe('Category description'),
  })
  .describe('Category definition')

export type Category = z.infer<typeof zCategorySchema>

/**
 * Component index file: components/index.json
 *
 * @example
 * ```json
 * {
 *   "$schema": "https://coral.design/components-index.schema.json",
 *   "name": "ACME Components",
 *   "version": "1.0.0",
 *   "components": [
 *     { "name": "Button", "path": "./button/button.coral.json", "category": "Actions" },
 *     { "name": "Card", "path": "./card/card.coral.json", "category": "Layout" }
 *   ],
 *   "categories": [
 *     { "name": "Actions", "description": "Interactive components" },
 *     { "name": "Layout", "description": "Layout components" }
 *   ]
 * }
 * ```
 */
export const zComponentIndexSchema = z
  .object({
    $schema: z.string().optional().describe('JSON schema reference'),

    /** Index name */
    name: z.string().describe('Index name'),

    /** Index version (usually matches package) */
    version: z.string().describe('Index version'),

    /** All components */
    components: z.array(zComponentEntrySchema).describe('Component entries'),

    /** Category definitions */
    categories: z.array(zCategorySchema).optional().describe('Category definitions'),
  })
  .describe('Component index')

export type ComponentIndex = z.infer<typeof zComponentIndexSchema>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create an empty component index
 */
export function createComponentIndex(name: string, version: string): ComponentIndex {
  return {
    $schema: 'https://coral.design/components-index.schema.json',
    name,
    version,
    components: [],
  }
}

/**
 * Add a component to the index
 */
export function addComponentToIndex(
  index: ComponentIndex,
  entry: ComponentEntry,
): ComponentIndex {
  return {
    ...index,
    components: [...index.components, entry],
  }
}

/**
 * Remove a component from the index by name
 */
export function removeComponentFromIndex(
  index: ComponentIndex,
  name: string,
): ComponentIndex {
  return {
    ...index,
    components: index.components.filter((c) => c.name !== name),
  }
}

/**
 * Find a component entry by name
 */
export function findComponentEntry(
  index: ComponentIndex,
  name: string,
): ComponentEntry | undefined {
  return index.components.find((c) => c.name === name)
}

/**
 * Get all components in a category
 */
export function getComponentsByCategory(
  index: ComponentIndex,
  category: string,
): ComponentEntry[] {
  return index.components.filter((c) => c.category === category)
}

/**
 * Get all components with a specific status
 */
export function getComponentsByStatus(
  index: ComponentIndex,
  status: ComponentEntry['status'],
): ComponentEntry[] {
  return index.components.filter((c) => c.status === status)
}

/**
 * Search components by tag
 */
export function searchComponentsByTag(
  index: ComponentIndex,
  tag: string,
): ComponentEntry[] {
  return index.components.filter((c) => c.tags?.includes(tag))
}

/**
 * Get unique categories from components
 */
export function getUniqueCategories(index: ComponentIndex): string[] {
  const categories = new Set<string>()
  for (const component of index.components) {
    if (component.category) {
      categories.add(component.category)
    }
  }
  return Array.from(categories).sort()
}

/**
 * Get all unique tags from components
 */
export function getAllTags(index: ComponentIndex): string[] {
  const tags = new Set<string>()
  for (const component of index.components) {
    if (component.tags) {
      for (const tag of component.tags) {
        tags.add(tag)
      }
    }
  }
  return Array.from(tags).sort()
}
