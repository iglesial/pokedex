import { useEffect, useId, useRef, type HTMLAttributes } from 'react'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import './SearchInput.css'

export interface SearchInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  onDebouncedChange: (value: string) => void
  debounceMs?: number
  placeholder?: string
  label: string
}

export function SearchInput({
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 200,
  placeholder,
  label,
  className,
  ...rest
}: SearchInputProps) {
  const inputId = useId()
  const debounced = useDebouncedValue(value, debounceMs)
  const lastEmittedRef = useRef<string>(value)

  useEffect(() => {
    if (debounced === lastEmittedRef.current) return
    lastEmittedRef.current = debounced
    onDebouncedChange(debounced)
  }, [debounced, onDebouncedChange])

  const classes = ['search-input', className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      <label htmlFor={inputId} className="search-input__label">
        {label}
      </label>
      <div className="search-input__control">
        <input
          id={inputId}
          type="search"
          className="search-input__field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
          }}
        />
        {value !== '' && (
          <button
            type="button"
            className="search-input__clear"
            aria-label="Clear search"
            onClick={() => {
              onChange('')
              lastEmittedRef.current = ''
              onDebouncedChange('')
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
