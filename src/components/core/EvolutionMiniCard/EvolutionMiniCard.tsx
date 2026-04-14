import { useState, type HTMLAttributes } from 'react'
import type { EvolutionNode } from '../../../types/evolutionChain'
import {
  formatPokedexNumber,
  toTitleCase,
} from '../../../utils/formatPokemon'
import './EvolutionMiniCard.css'

export interface EvolutionMiniCardProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  node: EvolutionNode
  current?: boolean
  onClick?: () => void
}

export function EvolutionMiniCard({
  node,
  current = false,
  onClick,
  className,
  ...rest
}: EvolutionMiniCardProps) {
  const interactive = !current && node.inKantoRange && Boolean(onClick)
  const titleName = toTitleCase(node.name)

  const classes = [
    'evo-mini',
    current && 'evo-mini--current',
    !node.inKantoRange && 'evo-mini--out-of-kanto',
    interactive && 'evo-mini--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const ariaProps = current
    ? { 'aria-current': 'page' as const }
    : undefined

  const content = (
    <>
      <div className="evo-mini__sprite-wrap">
        <MiniSprite src={node.spriteUrl} name={node.name} />
      </div>
      <div className="evo-mini__meta">
        <span className="evo-mini__number">
          {formatPokedexNumber(node.id)}
        </span>
        <span className="evo-mini__name">{titleName}</span>
        {!node.inKantoRange && (
          <span className="evo-mini__badge">Gen II+</span>
        )}
      </div>
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label={`View ${titleName} details`}
        {...rest}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={classes} {...ariaProps} {...rest}>
      {content}
    </div>
  )
}

function MiniSprite({
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
        className="evo-mini__sprite-fallback"
        aria-label={`${toTitleCase(name)} sprite unavailable`}
      >
        ?
      </div>
    )
  }

  return (
    <img
      className="evo-mini__sprite"
      src={src}
      alt={`${toTitleCase(name)} sprite`}
      onError={() => {
        setFailed(true)
      }}
    />
  )
}
