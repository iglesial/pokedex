import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Modal } from './Modal'

// jsdom lacks a reliable <dialog> showModal/close; stub always to ensure parity.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
    this.dispatchEvent(new Event('show'))
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

describe('Modal', () => {
  it('renders children when open', () => {
    render(
      <Modal open onClose={() => {}} heading={<h2>Title</h2>}>
        Body content
      </Modal>,
    )
    expect(screen.getByText('Body content')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose}>
        Body
      </Modal>,
    )
    await userEvent.click(screen.getByRole('button', { name: /close modal/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render close button when not dismissible', () => {
    render(
      <Modal open onClose={() => {}} dismissible={false}>
        Body
      </Modal>,
    )
    expect(
      screen.queryByRole('button', { name: /close modal/i }),
    ).not.toBeInTheDocument()
  })

  it('closes via native close event', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose}>
        Body
      </Modal>,
    )
    const dialog = document.querySelector('dialog')
    expect(dialog).not.toBeNull()
    dialog?.dispatchEvent(new Event('close'))
    expect(onClose).toHaveBeenCalled()
  })
})
