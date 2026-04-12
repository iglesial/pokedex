import { useEffect, useRef, type ReactNode } from 'react'
import './Modal.css'

export interface ModalProps {
  open: boolean
  onClose: () => void
  heading?: ReactNode
  dismissible?: boolean
  children: ReactNode
}

// Dev-only tracking to warn if multiple modals open simultaneously (research R6)
let openModalCount = 0

export function Modal({
  open,
  onClose,
  heading,
  dismissible = true,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        dialog.showModal()
        openModalCount++
        if (import.meta.env.DEV && openModalCount > 1) {
          console.warn(
            'Modal: multiple modals open simultaneously is not supported.',
          )
        }
      }
    } else if (dialog.open) {
      dialog.close()
      openModalCount = Math.max(0, openModalCount - 1)
    }

    return () => {
      if (dialog.open) {
        dialog.close()
        openModalCount = Math.max(0, openModalCount - 1)
      }
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      if (!dismissible) {
        event.preventDefault()
        return
      }
      onClose()
    }
    const handleClose = () => {
      onClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('close', handleClose)
    }
  }, [dismissible, onClose])

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (!dismissible) return
    // Backdrop click targets the dialog element itself
    if (event.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <dialog
      ref={dialogRef}
      className="modal"
      onClick={handleBackdropClick}
      aria-labelledby={heading ? 'modal-heading' : undefined}
    >
      <div className="modal__content">
        {heading && (
          <header id="modal-heading" className="modal__heading">
            {heading}
          </header>
        )}
        <div className="modal__body">{children}</div>
        {dismissible && (
          <button
            type="button"
            className="modal__close"
            aria-label="Close modal"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>
    </dialog>
  )
}
