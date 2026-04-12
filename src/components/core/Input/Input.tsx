import type { InputHTMLAttributes } from 'react'
import './Input.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ invalid, className, ...rest }: InputProps) {
  const classes = ['input', invalid && 'input--invalid', className]
    .filter(Boolean)
    .join(' ')
  return (
    <input className={classes} aria-invalid={invalid || undefined} {...rest} />
  )
}
