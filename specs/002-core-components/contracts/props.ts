/**
 * Props contracts for all 12 core components.
 *
 * This file is the source of truth for component APIs.
 * Each component MUST implement its Props interface as defined here.
 *
 * Conventions:
 * - Every Props type extends the native HTML attributes of the
 *   element it wraps.
 * - `children` is always ReactNode when present.
 * - Variant/severity props use union types (not enums).
 */

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

// ============================================================
// Feedback & Status
// ============================================================

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  severity: AlertSeverity
  title?: string
  /** Optional dismiss handler; renders a close button when provided. */
  onDismiss?: () => void
  children: ReactNode
}

export type BadgeVariant = 'neutral' | 'primary' | 'secondary'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant // default: 'neutral'
  children: ReactNode
}

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize // default: 'md'
  /** Accessible label announced to screen readers. Default: "Loading". */
  label?: string
}

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Current progress value. Clamped to [0, max]. */
  value: number
  /** Maximum value. Default: 100. */
  max?: number
  /** Visible or visually-hidden label for screen readers. */
  label?: string
}

// ============================================================
// Form Inputs
// ============================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant // default: 'primary'
  /** When true, renders a Spinner, sets aria-busy, and disables clicks. */
  loading?: boolean
  children: ReactNode
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Sets error styling and aria-invalid. */
  invalid?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
  children: ReactNode // <option> or <optgroup> elements
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

/**
 * FormField uses a render-prop to inject `id` and `aria-describedby`
 * into the nested input. The consumer spreads the provided ids onto
 * the input component.
 */
export interface FormFieldRenderIds {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

export interface FormFieldProps {
  label: string
  /** Optional help text shown below the field. */
  help?: string
  /** Error message. When present, sets invalid styling and aria-invalid. */
  error?: string
  children: (ids: FormFieldRenderIds) => ReactNode
}

// ============================================================
// Layout & Overlays
// ============================================================

export interface CardProps extends HTMLAttributes<HTMLElement> {
  heading?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export interface HeroProps extends HTMLAttributes<HTMLElement> {
  heading: ReactNode
  subheading?: ReactNode
  action?: ReactNode
}

export interface ModalProps {
  open: boolean
  /** Called when user dismisses via Escape, backdrop click, or close button. */
  onClose: () => void
  heading?: ReactNode
  /**
   * When false, backdrop click and Escape do NOT close the modal.
   * Default: true.
   */
  dismissible?: boolean
  children: ReactNode
}
