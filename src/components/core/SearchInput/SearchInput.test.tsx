import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { useState } from 'react'
import { SearchInput } from './SearchInput'

function Harness({
  debounceMs = 200,
  onDebouncedChange,
}: {
  debounceMs?: number
  onDebouncedChange: (v: string) => void
}) {
  const [value, setValue] = useState('')
  return (
    <SearchInput
      label="Search Pokémon"
      placeholder="Try 'char'"
      value={value}
      onChange={setValue}
      onDebouncedChange={onDebouncedChange}
      debounceMs={debounceMs}
    />
  )
}

describe('SearchInput', () => {
  it('renders with label and placeholder', () => {
    render(
      <SearchInput
        label="Search"
        placeholder="..."
        value=""
        onChange={() => {}}
        onDebouncedChange={() => {}}
      />,
    )
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('...')).toBeInTheDocument()
  })

  describe('with fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('onDebouncedChange fires only after the delay elapses', () => {
      const onDebounced = vi.fn()
      render(<Harness onDebouncedChange={onDebounced} />)
      const input = screen.getByLabelText('Search Pokémon')

      act(() => {
        fireEvent.change(input, { target: { value: 'c' } })
      })
      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(onDebounced).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(onDebounced).toHaveBeenCalledWith('c')
    })
  })

  it('clear button resets the value and fires immediately with empty string', () => {
    const onDebounced = vi.fn()
    render(<Harness onDebouncedChange={onDebounced} />)
    const input: HTMLInputElement = screen.getByLabelText('Search Pokémon')

    fireEvent.change(input, { target: { value: 'char' } })
    // After typing, the clear button should be available
    const clearBtn = screen.getByRole('button', { name: /clear search/i })
    fireEvent.click(clearBtn)

    expect(input.value).toBe('')
    expect(onDebounced).toHaveBeenLastCalledWith('')
  })

  it('does not render clear button when value is empty', () => {
    render(
      <SearchInput
        label="Search"
        value=""
        onChange={() => {}}
        onDebouncedChange={() => {}}
      />,
    )
    expect(
      screen.queryByRole('button', { name: /clear search/i }),
    ).not.toBeInTheDocument()
  })

  it('has no WCAG 2.1 AA violations', async () => {
    const { container } = render(
      <SearchInput
        label="Search Pokémon"
        placeholder="Try 'char'"
        value=""
        onChange={() => {}}
        onDebouncedChange={() => {}}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
