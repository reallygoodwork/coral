import * as z from 'zod'

/**
 * Conditional expression for conditional rendering and styles.
 * Supports prop references, logical operators, and comparisons.
 */
export type ConditionalExpression =
  | { $prop: string }
  | { $not: ConditionalExpression }
  | { $and: ConditionalExpression[] }
  | { $or: ConditionalExpression[] }
  | { $eq: [ConditionalExpression, unknown] }
  | { $ne: [ConditionalExpression, unknown] }

/**
 * Schema for conditional expressions
 * Supports:
 * - Simple prop reference: { "$prop": "showIcon" }
 * - Negation: { "$not": { "$prop": "loading" } }
 * - All must be true: { "$and": [...] }
 * - Any must be true: { "$or": [...] }
 * - Equality check: { "$eq": [{ "$prop": "size" }, "lg"] }
 * - Not equal: { "$ne": [{ "$prop": "size" }, "sm"] }
 */
export const zConditionalExpressionSchema: z.ZodType<ConditionalExpression> =
  z.lazy(() =>
    z.union([
      // Simple prop reference: { "$prop": "showIcon" }
      z
        .object({ $prop: z.string() })
        .describe('Reference to a boolean prop'),

      // Negation: { "$not": { "$prop": "loading" } }
      z
        .object({ $not: zConditionalExpressionSchema })
        .describe('Logical NOT - negates the expression'),

      // All must be true: { "$and": [...] }
      z
        .object({ $and: z.array(zConditionalExpressionSchema) })
        .describe('Logical AND - all expressions must be true'),

      // Any must be true: { "$or": [...] }
      z
        .object({ $or: z.array(zConditionalExpressionSchema) })
        .describe('Logical OR - any expression must be true'),

      // Equality check: { "$eq": [{ "$prop": "size" }, "lg"] }
      z
        .object({ $eq: z.tuple([zConditionalExpressionSchema, z.unknown()]) })
        .describe('Equality comparison'),

      // Not equal: { "$ne": [{ "$prop": "size" }, "sm"] }
      z
        .object({ $ne: z.tuple([zConditionalExpressionSchema, z.unknown()]) })
        .describe('Not equal comparison'),
    ]),
  )

/**
 * Behavior when conditional evaluates to false
 */
export const zConditionalBehaviorSchema = z
  .enum(['hide', 'dim', 'outline'])
  .describe(
    'Behavior when conditional is false: hide removes element, dim reduces opacity, outline shows placeholder',
  )

export type ConditionalBehavior = z.infer<typeof zConditionalBehaviorSchema>

/**
 * Conditional style definition - applies styles when condition is true
 */
export const zConditionalStyleSchema = z.lazy(() =>
  z.object({
    condition: zConditionalExpressionSchema.describe(
      'The condition to evaluate',
    ),
    styles: z
      .record(z.string(), z.unknown())
      .describe('Styles to apply when condition is true'),
  }),
)

export type ConditionalStyle = z.infer<typeof zConditionalStyleSchema>

// ============================================================================
// Evaluation Utility
// ============================================================================

/**
 * Evaluate a conditional expression against prop values
 *
 * @param expression - The conditional expression to evaluate
 * @param props - The current prop values
 * @returns boolean - Whether the condition is true
 *
 * @example
 * ```ts
 * // Simple prop check
 * evaluateCondition({ $prop: "isVisible" }, { isVisible: true }) // true
 *
 * // Negation
 * evaluateCondition({ $not: { $prop: "loading" } }, { loading: false }) // true
 *
 * // Equality
 * evaluateCondition({ $eq: [{ $prop: "size" }, "lg"] }, { size: "lg" }) // true
 *
 * // Complex expression
 * evaluateCondition(
 *   { $and: [{ $prop: "enabled" }, { $not: { $prop: "loading" } }] },
 *   { enabled: true, loading: false }
 * ) // true
 * ```
 */
export function evaluateCondition(
  expression: ConditionalExpression,
  props: Record<string, unknown>,
): boolean {
  if ('$prop' in expression) {
    return Boolean(props[expression.$prop])
  }

  if ('$not' in expression) {
    return !evaluateCondition(expression.$not, props)
  }

  if ('$and' in expression) {
    return expression.$and.every((expr) => evaluateCondition(expr, props))
  }

  if ('$or' in expression) {
    return expression.$or.some((expr) => evaluateCondition(expr, props))
  }

  if ('$eq' in expression) {
    const [left, right] = expression.$eq
    const leftValue =
      '$prop' in left ? props[left.$prop] : evaluateCondition(left, props)
    return leftValue === right
  }

  if ('$ne' in expression) {
    const [left, right] = expression.$ne
    const leftValue =
      '$prop' in left ? props[left.$prop] : evaluateCondition(left, props)
    return leftValue !== right
  }

  return false
}

/**
 * Type guard to check if a value is a conditional expression
 */
export function isConditionalExpression(
  value: unknown,
): value is ConditionalExpression {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return (
    '$prop' in value ||
    '$not' in value ||
    '$and' in value ||
    '$or' in value ||
    '$eq' in value ||
    '$ne' in value
  )
}
