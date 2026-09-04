import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { paginado } from '../../../test/fixtures'
import { renderComProviders } from '../../../test/utils'
import { EmpresaAptaSelect } from './EmpresaAptaSelect'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function empresasAptas(qtd: number) {
  return Array.from({ length: qtd }, (_, i) => ({
    id: i + 1,
    nome: `Empresa ${i + 1}`,
    status: 'Ativo' as const,
  }))
}

// Responde /empresas paginando de 10 em 10 conforme o param `page`.
function servirAptas(total: number) {
  const todas = empresasAptas(total)
  server.use(
    http.get('*/empresas', ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page') ?? '1')
      const per = 10
      const inicio = (page - 1) * per
      const fatia = todas.slice(inicio, inicio + per)
      return HttpResponse.json(
        paginado(fatia, { current_page: page, total, per_page: per }),
      )
    }),
  )
}

describe('EmpresaAptaSelect', () => {
  it('busca TODAS as páginas de aptas (>10 → todas selecionáveis, F1)', async () => {
    servirAptas(15)
    renderComProviders(<EmpresaAptaSelect value="" onChange={vi.fn()} />)

    // A 11ª e a 15ª (2ª página) precisam aparecer como opção.
    expect(await screen.findByRole('option', { name: 'Empresa 11' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Empresa 15' })).toBeInTheDocument()
    const select = screen.getByLabelText('Empresa')
    // 15 empresas + a opção "Selecione…"
    expect(within(select).getAllByRole('option')).toHaveLength(16)
  })

  it('na edição, injeta a empresa vinculada mesmo fora da lista', async () => {
    servirAptas(2)
    renderComProviders(
      <EmpresaAptaSelect
        value={99}
        onChange={vi.fn()}
        empresaVinculada={{ id: 99, nome: 'Fornecedor Vinculado', status: 'Ativo' }}
      />,
    )
    expect(
      await screen.findByRole('option', { name: 'Fornecedor Vinculado' }),
    ).toBeInTheDocument()
  })

  it('sem empresas aptas, orienta o usuário', async () => {
    servirAptas(0)
    renderComProviders(<EmpresaAptaSelect value="" onChange={vi.fn()} />)
    expect(
      await screen.findByText(/Nenhuma empresa apta/i),
    ).toBeInTheDocument()
  })
})
