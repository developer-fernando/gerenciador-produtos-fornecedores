import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { fazerEmpresa, paginado } from '../../../test/fixtures'
import { renderComProviders } from '../../../test/utils'
import { EmpresasPage } from './EmpresasPage'

const server = setupServer()
let requisicoes: URL[] = []

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
  requisicoes = []
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Handler de listagem que registra cada request e responde o corpo dado.
function listar(body: unknown, status = 200) {
  server.use(
    http.get('*/empresas', ({ request }) => {
      requisicoes.push(new URL(request.url))
      return HttpResponse.json(body as Record<string, unknown>, { status })
    }),
  )
}

describe('EmpresasPage', () => {
  it('mostra o carregamento e depois os dados', async () => {
    listar(paginado([fazerEmpresa({ nome: 'Alfa Ltda', produtos_count: 3 })]))
    renderComProviders(<EmpresasPage />)

    expect(screen.getByText('Carregando empresas…')).toBeInTheDocument()
    expect(await screen.findByText('Alfa Ltda')).toBeInTheDocument()
    // CNPJ formatado e contagem de produtos visíveis.
    expect(screen.getByText('12.345.678/0001-99')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('mostra o estado vazio quando não há empresas', async () => {
    listar(paginado([]))
    renderComProviders(<EmpresasPage />)
    expect(await screen.findByText('Nenhuma empresa encontrada.')).toBeInTheDocument()
  })

  it('mostra o estado de erro quando a API falha', async () => {
    listar({ message: 'Ocorreu um erro inesperado. Tente novamente.' }, 500)
    renderComProviders(<EmpresasPage />)
    expect(
      await screen.findByText('Não foi possível carregar as empresas.'),
    ).toBeInTheDocument()
  })

  it('pagina: ao avançar, refaz a consulta com page=2', async () => {
    listar(paginado([fazerEmpresa({ nome: 'Alfa Ltda' })], { total: 15, last_page: 2 }))
    renderComProviders(<EmpresasPage />)
    await screen.findByText('Alfa Ltda')

    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }))

    await waitFor(() => {
      const ultima = requisicoes.at(-1)
      expect(ultima?.searchParams.get('page')).toBe('2')
    })
  })

  it('filtros combinados: envia nome, status e excluidos juntos', async () => {
    listar(paginado([fazerEmpresa()]))
    renderComProviders(<EmpresasPage />)
    await screen.findByText('Fornecedor Exemplo Ltda')

    await userEvent.type(screen.getByLabelText('Nome'), 'alfa')
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'Inativo')
    await userEvent.click(screen.getByLabelText('Mostrar apenas excluídos'))

    await waitFor(() => {
      const ultima = requisicoes.at(-1)
      expect(ultima?.searchParams.get('nome')).toBe('alfa')
      expect(ultima?.searchParams.get('status')).toBe('Inativo')
      expect(ultima?.searchParams.get('excluidos')).toBe('true')
    })
  })

  it('invalida a listagem após uma ação (reflete sem reload) — F1', async () => {
    const user = userEvent.setup()
    listar(paginado([fazerEmpresa({ nome: 'Alfa Ltda' })]))
    server.use(
      http.delete('*/empresas/:id', () =>
        HttpResponse.json({ data: fazerEmpresa({ nome: 'Alfa Ltda', excluido: true }) }),
      ),
    )
    renderComProviders(<EmpresasPage />)
    await screen.findByText('Alfa Ltda')
    const getsAntes = requisicoes.length

    // Excluir a partir da ação da linha, confirmando no diálogo.
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    const dialogo = screen.getByRole('dialog')
    await user.click(within(dialogo).getByRole('button', { name: 'Excluir' }))

    // A mutação invalida ['empresas'] → a listagem é refeita (novo GET).
    await waitFor(() => expect(requisicoes.length).toBeGreaterThan(getsAntes))
  })

  it('exibe o badge de status na linha', async () => {
    listar(paginado([fazerEmpresa({ nome: 'Alfa Ltda', status: 'Inativo' })]))
    renderComProviders(<EmpresasPage />)
    const linha = (await screen.findByText('Alfa Ltda')).closest('tr')
    expect(within(linha as HTMLElement).getByText('Inativo')).toHaveAttribute(
      'data-variant',
      'inativo',
    )
  })
})
