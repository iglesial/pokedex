import type { TextareaHTMLAttributes } from 'react'
import './Textarea.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export function Textarea({ invalid, className, ...rest }: TextareaProps) {
  const classes = ['textarea', invalid && 'textarea--invalid', className]
    .filter(Boolean)
    .join(' ')
  return (
    <textarea
      className={classes}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}
