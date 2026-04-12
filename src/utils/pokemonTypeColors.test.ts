import { describe, it, expect } from 'vitest'
import { getTypeColorVar } from './pokemonTypeColors'

describe('getTypeColorVar', () => {
  it('returns the matching CSS variable for known types', () => {
    expect(getTypeColorVar('fire')).toBe('var(--color-type-fire)')
    expect(getTypeColorVar('water')).toBe('var(--color-type-water)')
    expect(getTypeColorVar('fairy')).toBe('var(--color-type-fairy)')
  })

  it('is case-insensitive', () => {
    expect(getTypeColorVar('FIRE')).toBe('var(--color-type-fire)')
    expect(getTypeColorVar('Grass')).toBe('var(--color-type-grass)')
  })

  it('returns the default variable for unknown types', () => {
    expect(getTypeColorVar('chaos')).toBe('var(--color-type-default)')
    expect(getTypeColorVar('')).toBe('var(--color-type-default)')
  })
})
