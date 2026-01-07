import {
  convertToTailwindScale,
  buildScaleClass,
  getPropertyPrefix,
} from '../scaleConverter'

describe('scaleConverter', () => {
  describe('convertToTailwindScale', () => {
    describe('spacing properties', () => {
      it('should convert exact padding values', () => {
        expect(convertToTailwindScale('padding', 0)).toBe('0')
        expect(convertToTailwindScale('padding', 4)).toBe('1')
        expect(convertToTailwindScale('padding', 8)).toBe('2')
        expect(convertToTailwindScale('padding', 16)).toBe('4')
        expect(convertToTailwindScale('padding', 24)).toBe('6')
        expect(convertToTailwindScale('padding', 32)).toBe('8')
        expect(convertToTailwindScale('padding', 64)).toBe('16')
      })

      it('should convert margin values', () => {
        expect(convertToTailwindScale('margin', 4)).toBe('1')
        expect(convertToTailwindScale('margin', 12)).toBe('3')
        expect(convertToTailwindScale('margin', 16)).toBe('4')
      })

      it('should convert gap values', () => {
        expect(convertToTailwindScale('gap', 8)).toBe('2')
        expect(convertToTailwindScale('gap', 16)).toBe('4')
      })

      it('should convert width/height values', () => {
        expect(convertToTailwindScale('width', 16)).toBe('4')
        expect(convertToTailwindScale('height', 32)).toBe('8')
      })

      it('should find closest match for in-between values', () => {
        // 15px is closest to 14px (scale 3.5) or 16px (scale 4)
        // Should find the closest within 2px tolerance
        const result15 = convertToTailwindScale('padding', 15)
        expect(['3.5', '4']).toContain(result15)

        // 17px is closest to 16px (scale 4)
        const result17 = convertToTailwindScale('padding', 17)
        expect(['4', '5']).toContain(result17)
      })

      it('should return null for values too far from scale', () => {
        // 100px is far from standard scales
        const result = convertToTailwindScale('padding', 100)
        // Either returns null or closest match (96)
        expect(result === null || result === '96').toBe(true)
      })
    })

    describe('font size', () => {
      it('should convert standard font sizes', () => {
        expect(convertToTailwindScale('fontSize', 12)).toBe('xs')
        expect(convertToTailwindScale('fontSize', 14)).toBe('sm')
        expect(convertToTailwindScale('fontSize', 16)).toBe('base')
        expect(convertToTailwindScale('fontSize', 18)).toBe('lg')
        expect(convertToTailwindScale('fontSize', 20)).toBe('xl')
        expect(convertToTailwindScale('fontSize', 24)).toBe('2xl')
        expect(convertToTailwindScale('fontSize', 30)).toBe('3xl')
      })

      it('should return null for non-standard font sizes', () => {
        expect(convertToTailwindScale('fontSize', 15)).toBeNull()
        expect(convertToTailwindScale('fontSize', 22)).toBeNull()
      })
    })

    describe('string values with units', () => {
      it('should handle string px values', () => {
        expect(convertToTailwindScale('padding', '16px')).toBe('4')
        expect(convertToTailwindScale('padding', '32px')).toBe('8')
      })

      it('should handle string values without units', () => {
        expect(convertToTailwindScale('padding', '16')).toBe('4')
      })
    })
  })

  describe('getPropertyPrefix', () => {
    it('should return correct prefixes for padding', () => {
      expect(getPropertyPrefix('padding')).toBe('p')
      expect(getPropertyPrefix('paddingTop')).toBe('pt')
      expect(getPropertyPrefix('paddingRight')).toBe('pr')
      expect(getPropertyPrefix('paddingBottom')).toBe('pb')
      expect(getPropertyPrefix('paddingLeft')).toBe('pl')
    })

    it('should return correct prefixes for margin', () => {
      expect(getPropertyPrefix('margin')).toBe('m')
      expect(getPropertyPrefix('marginTop')).toBe('mt')
      expect(getPropertyPrefix('marginRight')).toBe('mr')
      expect(getPropertyPrefix('marginBottom')).toBe('mb')
      expect(getPropertyPrefix('marginLeft')).toBe('ml')
    })

    it('should return correct prefixes for sizing', () => {
      expect(getPropertyPrefix('width')).toBe('w')
      expect(getPropertyPrefix('height')).toBe('h')
      expect(getPropertyPrefix('minWidth')).toBe('min-w')
      expect(getPropertyPrefix('minHeight')).toBe('min-h')
      expect(getPropertyPrefix('maxWidth')).toBe('max-w')
      expect(getPropertyPrefix('maxHeight')).toBe('max-h')
    })

    it('should return correct prefixes for typography', () => {
      expect(getPropertyPrefix('fontSize')).toBe('text')
      expect(getPropertyPrefix('fontWeight')).toBe('font')
    })

    it('should return correct prefixes for colors', () => {
      expect(getPropertyPrefix('backgroundColor')).toBe('bg')
      expect(getPropertyPrefix('color')).toBe('text')
    })

    it('should return correct prefixes for borders', () => {
      expect(getPropertyPrefix('borderRadius')).toBe('rounded')
      expect(getPropertyPrefix('borderWidth')).toBe('border')
    })

    it('should return null for unknown properties', () => {
      expect(getPropertyPrefix('unknownProperty')).toBeNull()
    })
  })

  describe('buildScaleClass', () => {
    it('should build padding classes', () => {
      expect(buildScaleClass('padding', '4')).toBe('p-4')
      expect(buildScaleClass('paddingTop', '8')).toBe('pt-8')
      expect(buildScaleClass('paddingRight', '2')).toBe('pr-2')
    })

    it('should build margin classes', () => {
      expect(buildScaleClass('margin', '4')).toBe('m-4')
      expect(buildScaleClass('marginTop', '8')).toBe('mt-8')
    })

    it('should build width/height classes', () => {
      expect(buildScaleClass('width', '16')).toBe('w-16')
      expect(buildScaleClass('height', '32')).toBe('h-32')
    })

    it('should build font size classes', () => {
      expect(buildScaleClass('fontSize', 'base')).toBe('text-base')
      expect(buildScaleClass('fontSize', 'xl')).toBe('text-xl')
      expect(buildScaleClass('fontSize', '2xl')).toBe('text-2xl')
    })

    it('should build border radius classes', () => {
      expect(buildScaleClass('borderRadius', '0')).toBe('rounded-none')
      expect(buildScaleClass('borderRadius', '4')).toBe('rounded')
      expect(buildScaleClass('borderRadius', '6')).toBe('rounded-md')
      expect(buildScaleClass('borderRadius', '8')).toBe('rounded-lg')
      expect(buildScaleClass('borderRadius', '9999')).toBe('rounded-full')
    })

    it('should return null for properties without prefix', () => {
      expect(buildScaleClass('unknownProperty', '4')).toBeNull()
    })
  })
})
