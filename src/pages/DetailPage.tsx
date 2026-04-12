import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Badge, Button, Spinner, StatRadar } from '../components'
import { useGetPokemon } from '../hooks/useGetPokemon'
import type { Pokemon } from '../types/pokemon'
import {
  formatHeight,
  formatPokedexNumber,
  formatWeight,
  toTitleCase,
} from '../utils/formatPokemon'
import { getTypeColorVar } from '../utils/pokemonTypeColors'
import './DetailPage.css'

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp.Atk',
  'special-defense': 'Sp.Def',
  speed: 'Speed',
}

type StatKey =
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed'

function getStatValue(pokemon: Pokemon, key: StatKey): number {
  const stat = pokemon.stats.find((s) => s.stat.name === key)
  return stat?.base_stat ?? 0
}

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pokemon, loading, error, notFound } = useGetPokemon(id ?? '')

  const handleBack = () => {
    const state = window.history.state as { idx?: number } | null
    if (state && typeof state.idx === 'number' && state.idx > 0) {
      void navigate(-1)
    } else {
      void navigate('/?page=1')
    }
  }

  if (notFound) {
    return (
      <main className="detail-page">
        <div className="detail-page__notfound">
          <h1>Pokémon Not Found</h1>
          <p>
            The Pokémon you&apos;re looking for is not in the Kanto Pokédex
            (1–151).
          </p>
          <Link to="/?page=1" className="detail-page__backlink">
            ← Back to list
          </Link>
        </div>
      </main>
    )
  }

  if (loading || !pokemon) {
    return (
      <main className="detail-page">
        <div className="detail-page__center">
          {error ? (
            <Alert severity="error" title="Failed to load Pokémon">
              {error}
            </Alert>
          ) : (
            <Spinner size="lg" label="Loading Pokémon" />
          )}
        </div>
      </main>
    )
  }

  const primaryType = pokemon.types[0]?.type.name ?? 'default'
  const accent = getTypeColorVar(primaryType)

  const spriteUrl =
    pokemon.sprites.other['official-artwork'].front_default ??
    pokemon.sprites.front_default

  return (
    <main
      className="detail-page"
      style={
        { '--detail-accent': accent } as React.CSSProperties
      }
    >
      <Button
        variant="ghost"
        onClick={handleBack}
        className="detail-page__back"
      >
        ← Back
      </Button>
      <div className="detail-page__header">
        <h1 className="detail-page__name">{toTitleCase(pokemon.name)}</h1>
        <span className="detail-page__number">
          {formatPokedexNumber(pokemon.id)}
        </span>
      </div>

      <div className="detail-page__grid">
        <section className="detail-page__identity">
          <div className="detail-page__sprite-wrap">
            <DetailSprite src={spriteUrl} name={pokemon.name} />
          </div>
          <div className="detail-page__types">
            {pokemon.types.map((t) => (
              <Badge
                key={t.type.name}
                style={{
                  backgroundColor: getTypeColorVar(t.type.name),
                  color: 'var(--color-text-on-primary)',
                  border: 'none',
                }}
              >
                {toTitleCase(t.type.name)}
              </Badge>
            ))}
          </div>
          <dl className="detail-page__metrics">
            <div className="detail-page__metric">
              <dt>Height</dt>
              <dd>{formatHeight(pokemon.height)}</dd>
            </div>
            <div className="detail-page__metric">
              <dt>Weight</dt>
              <dd>{formatWeight(pokemon.weight)}</dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="abilities-heading"
          className="detail-page__section"
        >
          <h2
            id="abilities-heading"
            className="detail-page__section-heading"
          >
            Abilities
          </h2>
          {pokemon.abilities.length === 0 ? (
            <p className="detail-page__empty">No abilities listed.</p>
          ) : (
            <div className="detail-page__abilities">
              {pokemon.abilities.map((a) => (
                <Badge
                  key={a.ability.name}
                  variant={a.is_hidden ? 'secondary' : 'neutral'}
                >
                  {a.is_hidden ? 'Hidden: ' : ''}
                  {toTitleCase(a.ability.name.replace(/-/g, ' '))}
                </Badge>
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="moves-heading"
          className="detail-page__section detail-page__section--full"
        >
          <h2 id="moves-heading" className="detail-page__section-heading">
            Moves
          </h2>
          {pokemon.moves.length === 0 ? (
            <p className="detail-page__empty">No moves listed.</p>
          ) : (
            <div
              className="detail-page__moves-container"
              role="region"
              aria-label="Move list, scrollable"
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
            >
              <ul className="detail-page__moves-grid">
                {pokemon.moves.map((m) => (
                  <li key={m.move.name} className="detail-page__move-chip">
                    {toTitleCase(m.move.name.replace(/-/g, ' '))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section
          aria-labelledby="stats-heading"
          className="detail-page__stats"
        >
          <h2 id="stats-heading" className="detail-page__section-heading">
            Base Stats
          </h2>
          <StatRadar
            stats={[
              { label: STAT_LABELS.hp, value: getStatValue(pokemon, 'hp') },
              {
                label: STAT_LABELS.attack,
                value: getStatValue(pokemon, 'attack'),
              },
              {
                label: STAT_LABELS.defense,
                value: getStatValue(pokemon, 'defense'),
              },
              {
                label: STAT_LABELS['special-attack'],
                value: getStatValue(pokemon, 'special-attack'),
              },
              {
                label: STAT_LABELS['special-defense'],
                value: getStatValue(pokemon, 'special-defense'),
              },
              {
                label: STAT_LABELS.speed,
                value: getStatValue(pokemon, 'speed'),
              },
            ]}
            fillColor={accent}
            caption={`Base stats for ${toTitleCase(pokemon.name)}.`}
          />
        </section>
      </div>
    </main>
  )
}

function DetailSprite({
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
        className="detail-page__sprite-fallback"
        aria-label={`${toTitleCase(name)} sprite unavailable`}
      >
        ?
      </div>
    )
  }

  return (
    <img
      className="detail-page__sprite"
      src={src}
      alt={`${toTitleCase(name)} sprite`}
      onError={() => {
        setFailed(true)
      }}
    />
  )
}
