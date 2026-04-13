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
