import { describe, it, expect } from 'vitest'
import { toTitleCase, formatPokedexNumber } from './formatPokemon'

describe('toTitleCase', () => {
  it('converts a single lowercase word', () => {
    expect(toTitleCase('bulbasaur')).toBe('Bulbasaur')
  })

  it('handles hyphenated names as separate words', () => {
    expect(toTitleCase('nidoran-m')).toBe('Nidoran M')
  })

  it('handles multi-word names', () => {
    expect(toTitleCase('mr mime')).toBe('Mr Mime')
  })

  it('returns empty string for empty input', () => {
    expect(toTitleCase('')).toBe('')
  })

  it('preserves all-caps abbreviations by lowercasing except first letter', () => {
    expect(toTitleCase('HGSS')).toBe('Hgss')
  })
})

describe('formatPokedexNumber', () => {
  it('pads single digits with leading zeros', () => {
    expect(formatPokedexNumber(1)).toBe('#001')
  })

  it('pads double digits', () => {
    expect(formatPokedexNumber(25)).toBe('#025')
  })

  it('leaves three-digit numbers alone', () => {
    expect(formatPokedexNumber(150)).toBe('#150')
  })

  it('handles four-digit numbers without truncation', () => {
    expect(formatPokedexNumber(1025)).toBe('#1025')
  })
})
