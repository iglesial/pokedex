import type { ReactNode, SelectHTMLAttributes } from 'react'
import './Select.css'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
  children: ReactNode
}

export function Select({ invalid, children, className, ...rest }: SelectProps) {
  const classes = ['select', invalid && 'select--invalid', className]
    .filter(Boolean)
    .join(' ')
  return (
    <select className={classes} aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  )
}
