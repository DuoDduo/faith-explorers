import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContactPage } from '../pages/ContactPage'

function renderPage() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ContactPage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('validates before calling the API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts the message and shows the server reply', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Thanks!' }), { status: 201 }),
    )
    vi.stubGlobal('fetch', fetchMock)
    renderPage()
    await userEvent.type(screen.getByLabelText('Name:'), 'Ada')
    await userEvent.type(screen.getByLabelText('Email:'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Message:'), 'Hello')
    await userEvent.click(screen.getByRole('button', { name: 'Send Message' }))

    expect(await screen.findByText('Thanks!')).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(JSON.parse(init.body)).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello',
    })
  })

  it('shows field errors returned by FastAPI', async () => {
    const body = { detail: [{ loc: ['body', 'email'], msg: 'value is not a valid email address' }] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 422 })))
    renderPage()
    await userEvent.type(screen.getByLabelText('Name:'), 'Ada')
    await userEvent.type(screen.getByLabelText('Email:'), 'ada@example.co')
    await userEvent.type(screen.getByLabelText('Message:'), 'Hi')
    await userEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    expect(await screen.findByText('value is not a valid email address')).toBeInTheDocument()
  })
})
