import {
  zConditionalExpressionSchema,
  evaluateCondition,
  isConditionalExpression,
  type ConditionalExpression,
} from '../structures/conditional'

describe('Conditional Expressions', () => {
  describe('Schema Validation', () => {
    it('should validate simple prop reference', () => {
      const expr = { $prop: 'isVisible' }
      const result = zConditionalExpressionSchema.safeParse(expr)
      expect(result.success).toBe(true)
    })

    it('should validate negation', () => {
      const expr = { $not: { $prop: 'loading' } }
      const result = zConditionalExpressionSchema.safeParse(expr)
      expect(result.success).toBe(true)
    })

    it('should validate AND expression', () => {
      const expr = { $and: [{ $prop: 'enabled' }, { $prop: 'visible' }] }
      const result = zConditionalExpressionSchema.safeParse(expr)
      expect(result.success).toBe(true)
    })

    it('should validate OR expression', () => {
      const expr = { $or: [{ $prop: 'active' }, { $prop: 'hovered' }] }
      const result = zConditionalExpressionSchema.safeParse(expr)
      expect(result.success).toBe(true)
    })

    it('should validate equality check', () => {
      const expr = { $eq: [{ $prop: 'size' }, 'lg'] }
      const result = zConditionalExpressionSchema.safeParse(expr)
      expect(result.success).toBe(true)
    })

    it('should validate not-equal check', () => {
      const expr = { $ne: [{ $prop: 'intent' }, 'destructive'] }
      const result = zConditionalExpressionSchema.safeParse(expr)
      expect(result.success).toBe(true)
    })

    it('should validate nested expressions', () => {
      const expr = {
        $and: [
          { $prop: 'enabled' },
          { $not: { $prop: 'loading' } },
          { $or: [{ $eq: [{ $prop: 'size' }, 'sm'] }, { $eq: [{ $prop: 'size' }, 'md'] }] },
        ],
      }
      const result = zConditionalExpressionSchema.safeParse(expr)
      expect(result.success).toBe(true)
    })
  })

  describe('evaluateCondition', () => {
    it('should evaluate simple prop reference', () => {
      expect(evaluateCondition({ $prop: 'isVisible' }, { isVisible: true })).toBe(true)
      expect(evaluateCondition({ $prop: 'isVisible' }, { isVisible: false })).toBe(false)
      expect(evaluateCondition({ $prop: 'isVisible' }, {})).toBe(false)
    })

    it('should evaluate negation', () => {
      expect(evaluateCondition({ $not: { $prop: 'loading' } }, { loading: false })).toBe(true)
      expect(evaluateCondition({ $not: { $prop: 'loading' } }, { loading: true })).toBe(false)
    })

    it('should evaluate AND expression', () => {
      const expr: ConditionalExpression = { $and: [{ $prop: 'a' }, { $prop: 'b' }] }
      expect(evaluateCondition(expr, { a: true, b: true })).toBe(true)
      expect(evaluateCondition(expr, { a: true, b: false })).toBe(false)
      expect(evaluateCondition(expr, { a: false, b: true })).toBe(false)
      expect(evaluateCondition(expr, { a: false, b: false })).toBe(false)
    })

    it('should evaluate OR expression', () => {
      const expr: ConditionalExpression = { $or: [{ $prop: 'a' }, { $prop: 'b' }] }
      expect(evaluateCondition(expr, { a: true, b: true })).toBe(true)
      expect(evaluateCondition(expr, { a: true, b: false })).toBe(true)
      expect(evaluateCondition(expr, { a: false, b: true })).toBe(true)
      expect(evaluateCondition(expr, { a: false, b: false })).toBe(false)
    })

    it('should evaluate equality check', () => {
      const expr: ConditionalExpression = { $eq: [{ $prop: 'size' }, 'lg'] }
      expect(evaluateCondition(expr, { size: 'lg' })).toBe(true)
      expect(evaluateCondition(expr, { size: 'sm' })).toBe(false)
    })

    it('should evaluate not-equal check', () => {
      const expr: ConditionalExpression = { $ne: [{ $prop: 'size' }, 'lg'] }
      expect(evaluateCondition(expr, { size: 'sm' })).toBe(true)
      expect(evaluateCondition(expr, { size: 'lg' })).toBe(false)
    })

    it('should evaluate complex nested expression', () => {
      // (enabled && !loading) && (size === 'lg' || size === 'md')
      const expr: ConditionalExpression = {
        $and: [
          { $and: [{ $prop: 'enabled' }, { $not: { $prop: 'loading' } }] },
          { $or: [{ $eq: [{ $prop: 'size' }, 'lg'] }, { $eq: [{ $prop: 'size' }, 'md'] }] },
        ],
      }

      expect(evaluateCondition(expr, { enabled: true, loading: false, size: 'lg' })).toBe(true)
      expect(evaluateCondition(expr, { enabled: true, loading: false, size: 'md' })).toBe(true)
      expect(evaluateCondition(expr, { enabled: true, loading: false, size: 'sm' })).toBe(false)
      expect(evaluateCondition(expr, { enabled: true, loading: true, size: 'lg' })).toBe(false)
      expect(evaluateCondition(expr, { enabled: false, loading: false, size: 'lg' })).toBe(false)
    })
  })

  describe('isConditionalExpression', () => {
    it('should identify conditional expressions', () => {
      expect(isConditionalExpression({ $prop: 'x' })).toBe(true)
      expect(isConditionalExpression({ $not: { $prop: 'x' } })).toBe(true)
      expect(isConditionalExpression({ $and: [] })).toBe(true)
      expect(isConditionalExpression({ $or: [] })).toBe(true)
      expect(isConditionalExpression({ $eq: [{ $prop: 'x' }, 'y'] })).toBe(true)
      expect(isConditionalExpression({ $ne: [{ $prop: 'x' }, 'y'] })).toBe(true)
    })

    it('should reject non-conditional values', () => {
      expect(isConditionalExpression(null)).toBe(false)
      expect(isConditionalExpression('string')).toBe(false)
      expect(isConditionalExpression(123)).toBe(false)
      expect(isConditionalExpression({ prop: 'x' })).toBe(false)
      expect(isConditionalExpression({})).toBe(false)
    })
  })
})
