import type { HTMLAttributes, ReactNode } from 'react'
import './Alert.css'

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  severity: AlertSeverity
  title?: string
  onDismiss?: () => void
  children: ReactNode
}

export function Alert({
  severity,
  title,
  onDismiss,
  children,
  className,
  ...rest
}: AlertProps) {
  const role =
    severity === 'error' || severity === 'warning' ? 'alert' : 'status'
  const classes = ['alert', `alert--${severity}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div role={role} className={classes} {...rest}>
      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        <div className="alert__content">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          aria-label="Dismiss alert"
          onClick={onDismiss}
        >
          ×
        </button>
      )}
    </div>
  )
}
