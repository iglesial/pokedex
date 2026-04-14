import type { HTMLAttributes } from 'react'
import { KNOWN_TYPES } from '../../../utils/filterPokemon'
import { getTypeColorVar } from '../../../utils/pokemonTypeColors'
import { toTitleCase } from '../../../utils/formatPokemon'
import './TypeFilterChips.css'

export interface TypeFilterChipsProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  selected: readonly string[]
  onChange: (selected: string[]) => void
  label?: string
}

export function TypeFilterChips({
  selected,
  onChange,
  label = 'Filter by type',
  className,
  ...rest
}: TypeFilterChipsProps) {
  const selectedSet = new Set(selected)
  const classes = ['type-chips', className].filter(Boolean).join(' ')

  const toggle = (type: string) => {
    if (selectedSet.has(type)) {
      onChange(selected.filter((t) => t !== type))
    } else {
      onChange([...selected, type])
    }
  }

  return (
    <div role="group" aria-label={label} className={classes} {...rest}>
      {KNOWN_TYPES.map((type) => {
        const isSelected = selectedSet.has(type)
        return (
          <button
            key={type}
            type="button"
            aria-pressed={isSelected}
            className={[
              'type-chips__chip',
              isSelected && 'type-chips__chip--selected',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ '--type-chip-color': getTypeColorVar(type) } as React.CSSProperties}
            onClick={() => {
              toggle(type)
            }}
          >
            {toTitleCase(type)}
          </button>
        )
      })}
    </div>
  )
}
