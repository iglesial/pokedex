import { useId, type HTMLAttributes } from 'react'
import './StatRadar.css'

export interface StatPoint {
  label: string
  value: number
}

export interface StatRadarProps extends HTMLAttributes<HTMLElement> {
  stats: [StatPoint, StatPoint, StatPoint, StatPoint, StatPoint, StatPoint]
  max?: number
  fillColor?: string
  caption?: string
}

const RADIUS = 100 // viewBox units
const GRID_LEVELS = [0.2, 0.4, 0.6, 0.8, 1.0]
// Start at top (−π/2), go clockwise by π/3 per axis
const ANGLES = Array.from({ length: 6 }, (_, i) => -Math.PI / 2 + i * (Math.PI / 3))

function vertex(radius: number, angle: number): [number, number] {
  return [radius * Math.cos(angle), radius * Math.sin(angle)]
}

function toPoints(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

export function StatRadar({
  stats,
  max = 255,
  fillColor = 'var(--color-primary)',
  caption,
  className,
  ...rest
}: StatRadarProps) {
  const captionId = useId()
  const classes = ['stat-radar', className].filter(Boolean).join(' ')

  const shapePoints = toPoints(
    stats.map((stat, i) => {
      const clamped = Math.min(Math.max(stat.value, 0), max)
      const r = (clamped / max) * RADIUS
      return vertex(r, ANGLES[i])
    }),
  )

  const gridPolygons = GRID_LEVELS.map((level) => {
    const vertices = ANGLES.map((a) => vertex(level * RADIUS, a))
    return (
      <polygon
        key={level}
        className="stat-radar__grid"
        points={toPoints(vertices)}
      />
    )
  })

  const axisLines = ANGLES.map((a, i) => {
    const [x, y] = vertex(RADIUS, a)
    return (
      <line
        key={i}
        className="stat-radar__axis"
        x1="0"
        y1="0"
        x2={x.toFixed(2)}
        y2={y.toFixed(2)}
      />
    )
  })

  const labels = stats.map((stat, i) => {
    const [x, y] = vertex(RADIUS + 24, ANGLES[i])
    // Top and bottom labels are centered; sides depend on angle
    const anchor =
      Math.abs(x) < 1 ? 'middle' : x > 0 ? 'start' : 'end'
    return (
      <g key={stat.label} className="stat-radar__label-group">
        <text
          x={x.toFixed(2)}
          y={y.toFixed(2)}
          textAnchor={anchor}
          dominantBaseline="middle"
          className="stat-radar__label"
        >
          {stat.label}
        </text>
        <text
          x={x.toFixed(2)}
          y={(y + 14).toFixed(2)}
          textAnchor={anchor}
          dominantBaseline="middle"
          className="stat-radar__value"
        >
          {stat.value.toString()}
        </text>
      </g>
    )
  })

  const captionText =
    caption ??
    `Stats: ${stats
      .map((s) => `${s.label} ${s.value.toString()}`)
      .join(', ')}.`

  return (
    <figure className={classes} {...rest}>
      <svg
        viewBox="-160 -150 320 310"
        role="img"
        aria-labelledby={captionId}
        className="stat-radar__svg"
      >
        <g className="stat-radar__grid-group">{gridPolygons}</g>
        <g className="stat-radar__axis-group">{axisLines}</g>
        <polygon
          className="stat-radar__shape"
          points={shapePoints}
          style={{ fill: fillColor, stroke: fillColor }}
        />
        <g className="stat-radar__labels">{labels}</g>
      </svg>
      <figcaption id={captionId} className="stat-radar__sr-only">
        {captionText}
      </figcaption>
    </figure>
  )
}
