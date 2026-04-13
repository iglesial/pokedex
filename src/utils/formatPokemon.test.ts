import { describe, it, expect } from 'vitest'
import {
  toTitleCase,
  formatPokedexNumber,
  formatHeight,
  formatWeight,
} from './formatPokemon'

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

describe('formatHeight', () => {
  it('converts decimetres to meters with one decimal', () => {
    expect(formatHeight(4)).toBe('0.4 m')
    expect(formatHeight(7)).toBe('0.7 m')
  })

  it('handles heights ≥ 1 meter', () => {
    expect(formatHeight(100)).toBe('10.0 m')
    expect(formatHeight(14)).toBe('1.4 m')
  })

  it('handles zero', () => {
    expect(formatHeight(0)).toBe('0.0 m')
  })
})

describe('formatWeight', () => {
  it('converts hectograms to kilograms with one decimal', () => {
    expect(formatWeight(60)).toBe('6.0 kg')
    expect(formatWeight(69)).toBe('6.9 kg')
  })

  it('handles heavy Pokémon', () => {
    expect(formatWeight(10000)).toBe('1000.0 kg')
  })

  it('handles zero', () => {
    expect(formatWeight(0)).toBe('0.0 kg')
  })
})
