/**
 * Contract for the StatRadar core component.
 *
 * Implementation lives in src/components/core/StatRadar/StatRadar.tsx.
 */

import type { HTMLAttributes } from 'react'

export interface StatPoint {
  /** Human-readable label shown on the axis (e.g., "HP", "Attack"). */
  label: string
  /** Raw stat value (0–max). Values outside range are clamped. */
  value: number
}

export interface StatRadarProps extends HTMLAttributes<HTMLElement> {
  /**
   * Six stat points in canonical order:
   * HP, Attack, Defense, Special Attack, Special Defense, Speed.
   */
  stats: [StatPoint, StatPoint, StatPoint, StatPoint, StatPoint, StatPoint]
  /** Scale maximum for the radar axes. Default: 255. */
  max?: number
  /**
   * CSS color (or CSS custom-property reference) used to fill the
   * stat polygon. Typically `getTypeColorVar(primaryType)`.
   * Default: `var(--color-primary)`.
   */
  fillColor?: string
  /** Accessible caption describing the chart's data (SR-only). */
  caption?: string
}
