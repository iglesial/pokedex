import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  heading?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export function Card({
  heading,
  footer,
  children,
  className,
  ...rest
}: CardProps) {
  const classes = ['card', className].filter(Boolean).join(' ')
  return (
    <article className={classes} {...rest}>
      {heading && <header className="card__heading">{heading}</header>}
      <div className="card__body">{children}</div>
      {footer && <footer className="card__footer">{footer}</footer>}
    </article>
  )
}
