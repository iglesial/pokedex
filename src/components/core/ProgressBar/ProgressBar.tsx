import type { HTMLAttributes } from 'react'
import './ProgressBar.css'

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  label?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
  ...rest
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max)
  if (import.meta.env.DEV && (value < 0 || value > max)) {
    console.warn(
      `ProgressBar: value ${String(value)} is out of range [0, ${String(max)}]; clamped to ${String(clamped)}`,
    )
  }
  const percent = (clamped / max) * 100

  const classes = ['progress-bar', className].filter(Boolean).join(' ')

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={classes}
      {...rest}
    >
      <div
        className="progress-bar__fill"
        style={{ width: `${percent.toString()}%` }}
      />
    </div>
  )
}
