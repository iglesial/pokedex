import type { HTMLAttributes } from 'react'
import './Spinner.css'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
  label?: string
}

export function Spinner({
  size = 'md',
  label = 'Loading',
  className,
  ...rest
}: SpinnerProps) {
  const classes = ['spinner', `spinner--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span role="status" className={classes} {...rest}>
      <svg
        className="spinner__circle"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="spinner__label">{label}</span>
    </span>
  )
}
