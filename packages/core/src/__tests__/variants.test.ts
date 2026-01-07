import {
  zVariantAxisSchema,
  zCompoundVariantConditionSchema,
  zComponentVariantsSchema,
  getVariantCombinations,
  getDefaultVariantValues,
  validateVariantValues,
  matchesCompoundCondition,
} from '../structures/variants'

describe('Variants Schema', () => {
  describe('VariantAxisSchema', () => {
    it('should validate a valid variant axis', () => {
      const axis = {
        name: 'intent',
        values: ['primary', 'secondary', 'destructive'],
        default: 'primary',
        description: 'Visual style',
      }
      const result = zVariantAxisSchema.safeParse(axis)
      expect(result.success).toBe(true)
    })

    it('should require at least one value', () => {
      const axis = {
        name: 'intent',
        values: [],
        default: 'primary',
      }
      const result = zVariantAxisSchema.safeParse(axis)
      expect(result.success).toBe(false)
    })

    it('should require valid identifier for name', () => {
      const axis = {
        name: 'invalid-name',
        values: ['a'],
        default: 'a',
      }
      const result = zVariantAxisSchema.safeParse(axis)
      expect(result.success).toBe(false)
    })
  })

  describe('CompoundVariantConditionSchema', () => {
    it('should validate a valid compound condition', () => {
      const compound = {
        conditions: { intent: 'destructive', size: 'sm' },
        description: 'Small destructive needs special handling',
      }
      const result = zCompoundVariantConditionSchema.safeParse(compound)
      expect(result.success).toBe(true)
    })
  })

  describe('ComponentVariantsSchema', () => {
    it('should validate full component variants', () => {
      const variants = {
        axes: [
          {
            name: 'intent',
            values: ['primary', 'secondary'],
            default: 'primary',
          },
          { name: 'size', values: ['sm', 'md', 'lg'], default: 'md' },
        ],
        compounds: [{ conditions: { intent: 'primary', size: 'lg' } }],
      }
      const result = zComponentVariantsSchema.safeParse(variants)
      expect(result.success).toBe(true)
    })

    it('should default to empty arrays', () => {
      const result = zComponentVariantsSchema.safeParse({})
      expect(result.success).toBe(true)
      expect(result.data?.axes).toEqual([])
      expect(result.data?.compounds).toEqual([])
    })
  })

  describe('getVariantCombinations', () => {
    it('should return all combinations', () => {
      const axes = [
        { name: 'intent', values: ['primary', 'secondary'] },
        { name: 'size', values: ['sm', 'md'] },
      ]
      const combinations = getVariantCombinations(axes)

      expect(combinations).toHaveLength(4)
      expect(combinations).toContainEqual({ intent: 'primary', size: 'sm' })
      expect(combinations).toContainEqual({ intent: 'primary', size: 'md' })
      expect(combinations).toContainEqual({ intent: 'secondary', size: 'sm' })
      expect(combinations).toContainEqual({ intent: 'secondary', size: 'md' })
    })

    it('should return empty object for no axes', () => {
      const combinations = getVariantCombinations([])
      expect(combinations).toEqual([{}])
    })

    it('should handle single axis', () => {
      const axes = [{ name: 'size', values: ['sm', 'md', 'lg'] }]
      const combinations = getVariantCombinations(axes)

      expect(combinations).toHaveLength(3)
      expect(combinations).toContainEqual({ size: 'sm' })
      expect(combinations).toContainEqual({ size: 'md' })
      expect(combinations).toContainEqual({ size: 'lg' })
    })
  })

  describe('getDefaultVariantValues', () => {
    it('should return default values', () => {
      const axes = [
        { name: 'intent', default: 'primary' },
        { name: 'size', default: 'md' },
      ]
      const defaults = getDefaultVariantValues(axes)

      expect(defaults).toEqual({ intent: 'primary', size: 'md' })
    })
  })

  describe('validateVariantValues', () => {
    const axes = [
      { name: 'intent', values: ['primary', 'secondary'], default: 'primary' },
      { name: 'size', values: ['sm', 'md', 'lg'], default: 'md' },
    ]

    it('should return no errors for valid values', () => {
      const errors = validateVariantValues(
        { intent: 'primary', size: 'lg' },
        axes,
      )
      expect(errors).toHaveLength(0)
    })

    it('should detect invalid axis name', () => {
      const errors = validateVariantValues({ color: 'red' }, axes)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Unknown variant axis')
    })

    it('should detect invalid value', () => {
      const errors = validateVariantValues({ intent: 'invalid' }, axes)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Invalid value')
    })
  })

  describe('matchesCompoundCondition', () => {
    it('should match when all conditions are met', () => {
      const compound = { conditions: { intent: 'primary', size: 'lg' } }
      expect(
        matchesCompoundCondition(compound, { intent: 'primary', size: 'lg' }),
      ).toBe(true)
    })

    it('should not match when some conditions are not met', () => {
      const compound = { conditions: { intent: 'primary', size: 'lg' } }
      expect(
        matchesCompoundCondition(compound, { intent: 'primary', size: 'sm' }),
      ).toBe(false)
      expect(
        matchesCompoundCondition(compound, { intent: 'secondary', size: 'lg' }),
      ).toBe(false)
    })

    it('should match when extra values are present', () => {
      const compound = { conditions: { intent: 'primary' } }
      expect(
        matchesCompoundCondition(compound, { intent: 'primary', size: 'lg' }),
      ).toBe(true)
    })
  })
})
