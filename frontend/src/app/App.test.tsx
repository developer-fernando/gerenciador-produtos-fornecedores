import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { AppProviders } from './providers'

describe('App (shell)', () => {
  it('renderiza a marca Horizon e cai na tela de Empresas', () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )
    expect(screen.getByRole('img', { name: 'Horizon' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Empresas' })).toBeInTheDocument()
  })
})
