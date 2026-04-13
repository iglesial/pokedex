const KNOWN_TYPES = new Set([
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
])

export function getTypeColorVar(type: string): string {
  const normalized = type.toLowerCase()
  return KNOWN_TYPES.has(normalized)
    ? `var(--color-type-${normalized})`
    : 'var(--color-type-default)'
}
