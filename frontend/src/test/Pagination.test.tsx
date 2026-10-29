import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '../components/Pagination'

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pages={1} onChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('marks the current page and reports clicks', async () => {
    const onChange = vi.fn()
    render(<Pagination page={2} pages={3} onChange={onChange} />)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })
})
