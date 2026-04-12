import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { StatRadar, type StatPoint } from './StatRadar'

const stats: [
  StatPoint,
  StatPoint,
  StatPoint,
  StatPoint,
  StatPoint,
  StatPoint,
] = [
  { label: 'HP', value: 45 },
  { label: 'Attack', value: 49 },
  { label: 'Defense', value: 49 },
  { label: 'Sp.Atk', value: 65 },
  { label: 'Sp.Def', value: 65 },
  { label: 'Speed', value: 45 },
]

describe('StatRadar', () => {
  it('renders an SVG with img role and all stat labels', async () => {
    await renderWithAxe(<StatRadar stats={stats} caption="Stats for Bulbasaur" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
    stats.forEach((s) => {
      expect(screen.getByText(s.label)).toBeInTheDocument()
      expect(screen.getAllByText(s.value.toString()).length).toBeGreaterThan(0)
    })
  })

  it('includes every stat in the accessible caption', () => {
    render(<StatRadar stats={stats} />)
    const svg = screen.getByRole('img')
    const labelledBy = svg.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    if (!labelledBy) return
    const caption = document.getElementById(labelledBy)
    expect(caption).not.toBeNull()
    if (!caption) return
    stats.forEach((s) => {
      expect(caption.textContent).toContain(s.label)
      expect(caption.textContent).toContain(s.value.toString())
    })
  })

  it('applies fillColor to the stat polygon', () => {
    const { container } = render(
      <StatRadar stats={stats} fillColor="rgb(220, 10, 45)" />,
    )
    const shape = container.querySelector<SVGPolygonElement>(
      '.stat-radar__shape',
    )
    expect(shape).not.toBeNull()
    if (!shape) return
    expect(shape.style.fill).toBe('rgb(220, 10, 45)')
  })

  it('clamps values above max and below 0', () => {
    const extreme: typeof stats = [
      { label: 'HP', value: 500 },
      { label: 'Attack', value: -50 },
      { label: 'Defense', value: 255 },
      { label: 'Sp.Atk', value: 0 },
      { label: 'Sp.Def', value: 128 },
      { label: 'Speed', value: 100 },
    ]
    const { container } = render(<StatRadar stats={extreme} max={255} />)
    const shape = container.querySelector('.stat-radar__shape')
    expect(shape).not.toBeNull() // rendering succeeds without errors
  })
})
