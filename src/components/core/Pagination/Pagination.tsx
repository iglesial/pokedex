import type { HTMLAttributes } from 'react'
import './Pagination.css'

export interface PaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Label for assistive tech. Default: "Pagination". */
  label?: string
}

type Token = number | 'gap-left' | 'gap-right'

/**
 * Builds a compact page list: always shows first, last, current
 * and neighbors; collapses the rest with ellipsis tokens.
 */
function buildPageTokens(current: number, total: number): Token[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const tokens: Token[] = [1]
  const windowStart = Math.max(2, current - 1)
  const windowEnd = Math.min(total - 1, current + 1)
  if (windowStart > 2) tokens.push('gap-left')
  for (let p = windowStart; p <= windowEnd; p++) tokens.push(p)
  if (windowEnd < total - 1) tokens.push('gap-right')
  tokens.push(total)
  return tokens
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  label = 'Pagination',
  className,
  ...rest
}: PaginationProps) {
  if (totalPages <= 1) return null
  const tokens = buildPageTokens(currentPage, totalPages)
  const classes = ['pagination', className].filter(Boolean).join(' ')

  return (
    <nav aria-label={label} className={classes} {...rest}>
      <ul className="pagination__list">
        <li>
          <button
            type="button"
            className="pagination__button"
            disabled={currentPage === 1}
            onClick={() => {
              onPageChange(currentPage - 1)
            }}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>
        </li>

        {tokens.map((token, idx) => {
          if (token === 'gap-left' || token === 'gap-right') {
            return (
              <li key={`${token}-${idx.toString()}`} aria-hidden="true">
                <span className="pagination__ellipsis">…</span>
              </li>
            )
          }
          const isCurrent = token === currentPage
          return (
            <li key={token}>
              <button
                type="button"
                className={[
                  'pagination__button',
                  isCurrent && 'pagination__button--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Page ${token.toString()}`}
                onClick={() => {
                  onPageChange(token)
                }}
              >
                {token}
              </button>
            </li>
          )
        })}

        <li>
          <button
            type="button"
            className="pagination__button"
            disabled={currentPage === totalPages}
            onClick={() => {
              onPageChange(currentPage + 1)
            }}
            aria-label="Next page"
          >
            Next ›
          </button>
        </li>
      </ul>
    </nav>
  )
}
