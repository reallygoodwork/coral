import * as t from '@babel/types'

import { getTypeFromTypeParameters } from '../getTypeFromTypeParameters'

describe('getTypeFromTypeParameters', () => {
  it('should return the name of the first type parameter', () => {
    const typeParams = t.tsTypeParameterInstantiation([
      t.tsTypeReference(t.identifier('MyType')),
      t.tsNumberKeyword(),
    ])
    const result = getTypeFromTypeParameters(typeParams)
    expect(result).toBe('MyType')
  })

  it('should return "unknown" if the first parameter is not a type reference', () => {
    const typeParams = t.tsTypeParameterInstantiation([t.tsNumberKeyword()])
    const result = getTypeFromTypeParameters(typeParams)
    expect(result).toBe('unknown')
  })

  it('should return "unknown" if there are no type parameters', () => {
    const typeParams = t.tsTypeParameterInstantiation([])
    const result = getTypeFromTypeParameters(typeParams)
    expect(result).toBe('unknown')
  })
})
