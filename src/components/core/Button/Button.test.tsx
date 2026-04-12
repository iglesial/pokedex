import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Button } from './Button'

describe('Button', () => {
  it('renders with default primary variant', async () => {
    await renderWithAxe(<Button>Click</Button>)
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument()
  })

  it.each(['primary', 'secondary', 'ghost'] as const)(
    'renders variant "%s"',
    (variant) => {
      const { container, unmount } = render(
        <Button variant={variant}>Go</Button>,
      )
      expect(container.querySelector(`.button--${variant}`)).toBeInTheDocument()
      unmount()
    },
  )

  it('disabled prevents onClick', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('loading state disables the button and shows spinner', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Submit
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })
})
