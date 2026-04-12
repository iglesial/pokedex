import type { HTMLAttributes, ReactNode } from 'react'
import './Hero.css'

export interface HeroProps extends HTMLAttributes<HTMLElement> {
  heading: ReactNode
  subheading?: ReactNode
  action?: ReactNode
}

export function Hero({
  heading,
  subheading,
  action,
  className,
  ...rest
}: HeroProps) {
  const classes = ['hero', className].filter(Boolean).join(' ')
  return (
    <section className={classes} {...rest}>
      <div className="hero__content">
        <div className="hero__heading">{heading}</div>
        {subheading && <p className="hero__subheading">{subheading}</p>}
        {action && <div className="hero__action">{action}</div>}
      </div>
    </section>
  )
}
