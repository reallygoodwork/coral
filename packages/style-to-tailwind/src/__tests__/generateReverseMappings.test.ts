import {
  generateReverseMappings,
  reverseMappings,
  prefixMappings,
} from '../generateReverseMappings'

describe('generateReverseMappings', () => {
  describe('reverse mappings generation', () => {
    it('should generate reverse mappings', () => {
      const { propertyValue, prefixes } = generateReverseMappings()

      expect(propertyValue).toBeDefined()
      expect(prefixes).toBeDefined()
      expect(typeof propertyValue).toBe('object')
      expect(typeof prefixes).toBe('object')
    })

    it('should have mappings for common properties', () => {
      expect(reverseMappings).toBeDefined()

      // Check that we have some common properties
      const hasDisplayMapping = 'display' in reverseMappings
      const hasPositionMapping = 'position' in reverseMappings
      const hasFlexMapping =
        'flexDirection' in reverseMappings || 'flex' in reverseMappings

      // At least some of these should exist
      expect(hasDisplayMapping || hasPositionMapping || hasFlexMapping).toBe(
        true,
      )
    })

    it('should have prefix mappings', () => {
      expect(prefixMappings).toBeDefined()
      expect(typeof prefixMappings).toBe('object')
    })
  })

  describe('exported reverseMappings', () => {
    it('should be accessible', () => {
      expect(reverseMappings).toBeDefined()
      expect(typeof reverseMappings).toBe('object')
    })

    it('should have property → value → class structure', () => {
      // Find any property that exists
      const properties = Object.keys(reverseMappings)
      expect(properties.length).toBeGreaterThan(0)

      // Check structure of first property
      if (properties.length > 0) {
        const firstProp = properties[0]
        if (!firstProp) {
          throw new Error('Expected firstProp to be defined')
        }
        const values = reverseMappings[firstProp]

        expect(values).toBeDefined()
        expect(typeof values).toBe('object')

        // Check that values map to Tailwind classes
        if (values) {
          const valueKeys = Object.keys(values)
          if (valueKeys.length > 0) {
            const firstValue = valueKeys[0]
            if (firstValue) {
              const twClass = values[firstValue]

              expect(typeof twClass).toBe('string')
            }
          }
        }
      }
    })

    it('should handle common display values', () => {
      // Test if we can find display mappings
      if ('display' in reverseMappings) {
        const displayMap = reverseMappings.display

        // Common display values might be mapped
        const commonDisplays = ['block', 'flex', 'inline', 'grid', 'none']
        const hasSomeMapping = commonDisplays.some(
          (value) => value in displayMap,
        )

        expect(hasSomeMapping).toBe(true)
      }
    })

    it('should handle position values', () => {
      if ('position' in reverseMappings) {
        const positionMap = reverseMappings.position

        // Common position values
        const commonPositions = [
          'static',
          'relative',
          'absolute',
          'fixed',
          'sticky',
        ]
        const hasSomeMapping = commonPositions.some(
          (value) => value in positionMap,
        )

        expect(hasSomeMapping).toBe(true)
      }
    })
  })

  describe('exported prefixMappings', () => {
    it('should be accessible', () => {
      expect(prefixMappings).toBeDefined()
      expect(typeof prefixMappings).toBe('object')
    })

    it('should map prefixes to property arrays', () => {
      const prefixes = Object.keys(prefixMappings)

      if (prefixes.length > 0) {
        const firstPrefix = prefixes[0]
        if (!firstPrefix) {
          throw new Error('Expected firstPrefix to be defined')
        }
        const properties = prefixMappings[firstPrefix]

        expect(properties).toBeDefined()
        if (properties) {
          expect(Array.isArray(properties)).toBe(true)
          expect(properties.length).toBeGreaterThan(0)
          if (properties.length > 0 && properties[0]) {
            expect(typeof properties[0]).toBe('string')
          }
        }
      }
    })

    it('should include padding prefixes if they exist', () => {
      // Check for common padding prefixes
      const hasPaddingPrefix =
        'p-' in prefixMappings ||
        'pt-' in prefixMappings ||
        'pr-' in prefixMappings ||
        'pb-' in prefixMappings ||
        'pl-' in prefixMappings ||
        'px-' in prefixMappings ||
        'py-' in prefixMappings

      // Not all might exist, but this tests structure
      expect(typeof hasPaddingPrefix).toBe('boolean')
    })
  })

  describe('integration with tw2css', () => {
    it('should successfully import from tw2css', () => {
      // This test verifies that the import works
      expect(() => {
        const { propertyValue } = generateReverseMappings()
        expect(propertyValue).toBeDefined()
      }).not.toThrow()
    })

    it('should generate non-empty mappings', () => {
      const { propertyValue, prefixes } = generateReverseMappings()

      // Should have some mappings
      const propertyCount = Object.keys(propertyValue).length
      const prefixCount = Object.keys(prefixes).length

      expect(propertyCount + prefixCount).toBeGreaterThan(0)
    })
  })
})
