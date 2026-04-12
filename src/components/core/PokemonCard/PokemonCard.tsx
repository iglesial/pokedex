import { useState, type HTMLAttributes } from 'react'
import { Badge } from '../Badge/Badge'
import type { PokemonListEntry } from '../../../services/pokemonService'
import {
  formatPokedexNumber,
  toTitleCase,
} from '../../../utils/formatPokemon'
import { getTypeColorVar } from '../../../utils/pokemonTypeColors'
import './PokemonCard.css'

export interface PokemonCardProps extends HTMLAttributes<HTMLElement> {
  pokemon: PokemonListEntry
}

export function PokemonCard({ pokemon, className, ...rest }: PokemonCardProps) {
  const primaryType = pokemon.types[0] ?? 'default'
  const cardStyle = {
    '--pokemon-card-accent': getTypeColorVar(primaryType),
  } as React.CSSProperties

  const classes = ['pokemon-card', className].filter(Boolean).join(' ')

  return (
    <article className={classes} style={cardStyle} {...rest}>
      <div className="pokemon-card__top">
        <span className="pokemon-card__number">
          {formatPokedexNumber(pokemon.id)}
        </span>
      </div>
      <div className="pokemon-card__sprite-wrapper">
        <div className="pokemon-card__sprite-bg" aria-hidden="true" />
        <PokemonSprite src={pokemon.spriteUrl} name={pokemon.name} />
      </div>
      <h2 className="pokemon-card__name">{toTitleCase(pokemon.name)}</h2>
      <div className="pokemon-card__types">
        {pokemon.types.map((type) => (
          <Badge
            key={type}
            style={{
              backgroundColor: getTypeColorVar(type),
              color: 'var(--color-text-on-primary)',
              border: 'none',
            }}
          >
            {toTitleCase(type)}
          </Badge>
        ))}
      </div>
    </article>
  )
}

function PokemonSprite({
  src,
  name,
}: {
  src: string | null
  name: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className="pokemon-card__sprite-fallback"
        aria-label={`${toTitleCase(name)} sprite unavailable`}
      >
        ?
      </div>
    )
  }

  return (
    <img
      className="pokemon-card__sprite"
      src={src}
      alt={`${toTitleCase(name)} sprite`}
      onError={() => {
        setFailed(true)
      }}
    />
  )
}
