import {
  zTokenReferenceSchema,
  zPropReferenceSchema,
  zComponentReferenceSchema,
  zAssetReferenceSchema,
  zExternalReferenceSchema,
  isTokenReference,
  isPropReference,
  isComponentReference,
  isAssetReference,
  isExternalReference,
  isAnyReference,
} from '../structures/references'

describe('References Schema', () => {
  describe('TokenReferenceSchema', () => {
    it('should validate a valid token reference', () => {
      const validRef = { $token: 'color.primary.500' }
      const result = zTokenReferenceSchema.safeParse(validRef)
      expect(result.success).toBe(true)
    })

    it('should validate token reference with fallback', () => {
      const ref = { $token: 'color.missing', $fallback: '#000000' }
      const result = zTokenReferenceSchema.safeParse(ref)
      expect(result.success).toBe(true)
    })

    it('should reject invalid token reference', () => {
      const invalid = { token: 'color.primary' } // missing $
      const result = zTokenReferenceSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('PropReferenceSchema', () => {
    it('should validate a valid prop reference', () => {
      const validRef = { $prop: 'disabled' }
      const result = zPropReferenceSchema.safeParse(validRef)
      expect(result.success).toBe(true)
    })

    it('should reject invalid prop reference', () => {
      const invalid = { prop: 'disabled' }
      const result = zPropReferenceSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('ComponentReferenceSchema', () => {
    it('should validate a valid component reference', () => {
      const validRef = {
        $component: { ref: './button/button.coral.json' },
      }
      const result = zComponentReferenceSchema.safeParse(validRef)
      expect(result.success).toBe(true)
    })

    it('should validate component reference with version', () => {
      const ref = {
        $component: { ref: '@acme/button', version: '^1.0.0' },
        propBindings: { intent: 'primary' },
      }
      const result = zComponentReferenceSchema.safeParse(ref)
      expect(result.success).toBe(true)
    })
  })

  describe('AssetReferenceSchema', () => {
    it('should validate a valid asset reference', () => {
      const validRef = { $asset: 'icons/arrow.svg' }
      const result = zAssetReferenceSchema.safeParse(validRef)
      expect(result.success).toBe(true)
    })
  })

  describe('ExternalReferenceSchema', () => {
    it('should validate a valid external reference', () => {
      const validRef = {
        $external: { package: 'react-icons', path: 'fa/FaArrow' },
      }
      const result = zExternalReferenceSchema.safeParse(validRef)
      expect(result.success).toBe(true)
    })
  })

  describe('Type Guards', () => {
    it('isTokenReference should correctly identify token refs', () => {
      expect(isTokenReference({ $token: 'color.primary' })).toBe(true)
      expect(isTokenReference({ $prop: 'disabled' })).toBe(false)
      expect(isTokenReference('string')).toBe(false)
      expect(isTokenReference(null)).toBe(false)
    })

    it('isPropReference should correctly identify prop refs', () => {
      expect(isPropReference({ $prop: 'disabled' })).toBe(true)
      expect(isPropReference({ $prop: 'x', $transform: 'not' })).toBe(false) // transforms are different
      expect(isPropReference({ $token: 'color' })).toBe(false)
    })

    it('isComponentReference should correctly identify component refs', () => {
      expect(isComponentReference({ $component: { ref: './btn.json' } })).toBe(true)
      expect(isComponentReference({ $prop: 'disabled' })).toBe(false)
    })

    it('isAssetReference should correctly identify asset refs', () => {
      expect(isAssetReference({ $asset: 'icon.svg' })).toBe(true)
      expect(isAssetReference({ $prop: 'disabled' })).toBe(false)
    })

    it('isExternalReference should correctly identify external refs', () => {
      expect(isExternalReference({ $external: { package: 'x', path: 'y' } })).toBe(true)
      expect(isExternalReference({ $prop: 'disabled' })).toBe(false)
    })

    it('isAnyReference should identify any type of reference', () => {
      expect(isAnyReference({ $token: 'color' })).toBe(true)
      expect(isAnyReference({ $prop: 'disabled' })).toBe(true)
      expect(isAnyReference({ $component: { ref: 'x' } })).toBe(true)
      expect(isAnyReference({ $asset: 'icon.svg' })).toBe(true)
      expect(isAnyReference({ $external: { package: 'x', path: 'y' } })).toBe(true)
      expect(isAnyReference('string')).toBe(false)
      expect(isAnyReference(123)).toBe(false)
    })
  })
})
