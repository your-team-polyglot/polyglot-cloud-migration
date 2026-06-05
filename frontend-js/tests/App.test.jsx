import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
  mockFetch.mockImplementation((url) => {
    if (url.includes('/api/status')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'ok',
          version: '1.0.0',
          message: 'Polyglot Cloud Migration API is running',
          service: '.NET Backend API',
        }),
      })
    }
    if (url.includes('/api/tasks')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Sample Task', status: 'pending' },
        ]),
      })
    }
    return Promise.reject(new Error('Unknown URL'))
  })
})

describe('App component', () => {
  it('renders the header title', async () => {
    render(<App />)
    expect(screen.getByText(/Polyglot Cloud Migration/i)).toBeInTheDocument()
  })

  it('renders backend status after fetch', async () => {
    render(<App />)
    await waitFor(() =>
      expect(screen.getByText(/\.NET Backend API/i)).toBeInTheDocument()
    )
  })

  it('renders tasks from API', async () => {
    render(<App />)
    await waitFor(() =>
      expect(screen.getByText('Sample Task')).toBeInTheDocument()
    )
  })

  it('renders the task input field', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/New task title/i)).toBeInTheDocument()
  })

  it('renders the tech stack section', () => {
    render(<App />)
    expect(screen.getByText(/Tech Stack/i)).toBeInTheDocument()
  })
})
