export function toTitleCase(str: string): string {
  if (!str) return ''
  return str
    .split(/[-\s]/)
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '',
    )
    .join(' ')
}

export function formatPokedexNumber(id: number): string {
  return `#${id.toString().padStart(3, '0')}`
}

/** Convert PokéAPI height (decimetres) to display "X.X m". */
export function formatHeight(decimetres: number): string {
  return `${(decimetres / 10).toFixed(1)} m`
}

/** Convert PokéAPI weight (hectograms) to display "X.X kg". */
export function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`
}
