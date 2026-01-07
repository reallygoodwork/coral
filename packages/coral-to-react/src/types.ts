/**
 * Options for generating React components from Coral specifications
 */
export interface Options {
  /**
   * Component declaration style
   * @default 'function'
   */
  componentFormat?: 'function' | 'arrow'

  /**
   * How to output styles
   * @default 'inline'
   */
  styleFormat?: 'inline' | 'className'

  /**
   * Generate TypeScript types for props
   * @default true
   */
  includeTypes?: boolean

  /**
   * Indentation size in spaces
   * @default 2
   */
  indentSize?: number

  /**
   * Format output with Prettier
   * @default false
   */
  prettier?: boolean

  /**
   * Whether to flatten component composition (inline instances)
   * @default false
   */
  flattenComposition?: boolean

  /**
   * How to handle variants
   * @default 'inline'
   */
  variantStrategy?: 'cva' | 'inline' | 'custom'
}

/**
 * Output file for package generation
 */
export interface GeneratedFile {
  /** File path relative to output directory */
  path: string
  /** File content */
  content: string
}

/**
 * Result of package generation
 */
export interface PackageGenerationResult {
  /** Generated component files */
  components: GeneratedFile[]
  /** Generated CSS files */
  styles: GeneratedFile[]
  /** Index file */
  index?: GeneratedFile
}
