import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../shared/components/ToastProvider'

/** QueryClient de teste: sem retry, para os erros aparecerem de imediato. */
export function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

/** Renderiza a UI com os providers (Query + Toast + Router de memória). */
export function renderComProviders(ui: ReactElement, rota = '/empresas') {
  const client = criarQueryClient()
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={[rota]}>{ui}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}
