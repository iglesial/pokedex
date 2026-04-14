import { Fragment, type HTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../Alert/Alert'
import { Spinner } from '../Spinner/Spinner'
import { EvolutionMiniCard } from '../EvolutionMiniCard/EvolutionMiniCard'
import { useEvolutionChain } from '../../../hooks/useEvolutionChain'
import type { EvolutionNode } from '../../../types/evolutionChain'
import './EvolutionChain.css'

export interface EvolutionChainProps extends HTMLAttributes<HTMLElement> {
  pokemonId: number
}

function ChainArrow() {
  return (
    <svg
      className="evo-chain__arrow"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 12 H17 M13 8 L17 12 L13 16"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EvolutionChain({
  pokemonId,
  className,
  ...rest
}: EvolutionChainProps) {
  const { chain, loading, error } = useEvolutionChain(pokemonId)
  const navigate = useNavigate()

  const goTo = (node: EvolutionNode) => {
    if (node.id === pokemonId || !node.inKantoRange) return
    void navigate(`/pokemon/${node.id.toString()}`)
  }

  const sectionClasses = ['evo-chain', className].filter(Boolean).join(' ')

  return (
    <section
      aria-labelledby="evolution-heading"
      className={sectionClasses}
      {...rest}
    >
      <h2 id="evolution-heading" className="evo-chain__heading">
        Evolution
      </h2>

      {loading && (
        <div className="evo-chain__center">
          <Spinner size="sm" label="Loading evolutions" />
        </div>
      )}

      {error && (
        <Alert severity="error" title="Couldn&rsquo;t load evolutions">
          {error}
        </Alert>
      )}

      {!loading && !error && chain && chain.branches.length === 0 && (
        <p className="evo-chain__empty">This Pokémon does not evolve.</p>
      )}

      {!loading && !error && chain && chain.branches.length > 0 && (
        <ChainBody chain={chain} pokemonId={pokemonId} onSelect={goTo} />
      )}
    </section>
  )
}

function ChainBody({
  chain,
  pokemonId,
  onSelect,
}: {
  chain: { root: EvolutionNode; branches: EvolutionNode[][] }
  pokemonId: number
  onSelect: (node: EvolutionNode) => void
}) {
  const branching = chain.branches.length > 1

  if (branching) {
    return (
      <div className="evo-chain__branching">
        <EvolutionMiniCard
          node={chain.root}
          current={chain.root.id === pokemonId}
          onClick={() => {
            onSelect(chain.root)
          }}
        />
        <div className="evo-chain__branches">
          {chain.branches.map((branch, branchIdx) => (
            <div key={branchIdx} className="evo-chain__branch">
              <ChainArrow />
              {branch.map((node, stageIdx) => (
                <Fragment key={`${node.id.toString()}-${stageIdx.toString()}`}>
                  {stageIdx > 0 && <ChainArrow />}
                  <EvolutionMiniCard
                    node={node}
                    current={node.id === pokemonId}
                    onClick={() => {
                      onSelect(node)
                    }}
                  />
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Linear chain: root + one branch.
  const branch = chain.branches[0]
  return (
    <div className="evo-chain__linear">
      <EvolutionMiniCard
        node={chain.root}
        current={chain.root.id === pokemonId}
        onClick={() => {
          onSelect(chain.root)
        }}
      />
      {branch.map((node, idx) => (
        <Fragment key={`${node.id.toString()}-${idx.toString()}`}>
          <ChainArrow />
          <EvolutionMiniCard
            node={node}
            current={node.id === pokemonId}
            onClick={() => {
              onSelect(node)
            }}
          />
        </Fragment>
      ))}
    </div>
  )
}
