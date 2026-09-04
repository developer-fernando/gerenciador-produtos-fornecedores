import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App (smoke)', () => {
  it('renderiza o shell inicial', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Horizon' })).toBeInTheDocument()
  })
})
