import { useId, type ReactNode } from 'react'
import './FormField.css'

export interface FormFieldRenderIds {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

export interface FormFieldProps {
  label: string
  help?: string
  error?: string
  children: (ids: FormFieldRenderIds) => ReactNode
}

export function FormField({ label, help, error, children }: FormFieldProps) {
  const id = useId()
  const helpId = `${id}-help`
  const errorId = `${id}-error`

  const describedBy = error ? errorId : help ? helpId : undefined

  const ids: FormFieldRenderIds = {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
  }

  return (
    <div
      className={['form-field', error && 'form-field--invalid']
        .filter(Boolean)
        .join(' ')}
    >
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      {children(ids)}
      {help && !error && (
        <p id={helpId} className="form-field__help">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
