import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { fazerProduto, paginado } from '../../../test/fixtures'
import { renderComProviders } from '../../../test/utils'
import { ProdutosPage } from './ProdutosPage'

const server = setupServer()
let requisicoes: URL[] = []

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
  requisicoes = []
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function listar(body: unknown, status = 200) {
  server.use(
    http.get('*/produtos', ({ request }) => {
      requisicoes.push(new URL(request.url))
      return HttpResponse.json(body as Record<string, unknown>, { status })
    }),
  )
}

describe('ProdutosPage', () => {
  it('mostra o carregamento e depois os dados (empresa + preço formatado)', async () => {
    listar(
      paginado([
        fazerProduto({
          nome: 'Cadeira Gamer',
          preco: '1299.90',
          empresa: { id: 2, nome: 'Móveis Corona', status: 'Ativo' },
        }),
      ]),
    )
    renderComProviders(<ProdutosPage />, '/produtos')

    expect(screen.getByText('Carregando produtos…')).toBeInTheDocument()
    expect(await screen.findByText('Cadeira Gamer')).toBeInTheDocument()
    expect(screen.getByText('Móveis Corona')).toBeInTheDocument()
    // Preço formatado em BRL (espaço pode ser NBSP).
    expect(screen.getByText(/R\$\s?1\.299,90/)).toBeInTheDocument()
  })

  it('mostra o estado vazio', async () => {
    listar(paginado([]))
    renderComProviders(<ProdutosPage />, '/produtos')
    expect(await screen.findByText('Nenhum produto encontrado.')).toBeInTheDocument()
  })

  it('mostra o estado de erro', async () => {
    listar({ message: 'Ocorreu um erro inesperado. Tente novamente.' }, 500)
    renderComProviders(<ProdutosPage />, '/produtos')
    expect(
      await screen.findByText('Não foi possível carregar os produtos.'),
    ).toBeInTheDocument()
  })

  it('pagina: ao avançar, refaz a consulta com page=2', async () => {
    listar(paginado([fazerProduto({ nome: 'Produto A' })], { total: 15, last_page: 2 }))
    renderComProviders(<ProdutosPage />, '/produtos')
    await screen.findByText('Produto A')

    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }))

    await waitFor(() => {
      expect(requisicoes.at(-1)?.searchParams.get('page')).toBe('2')
    })
  })

  it('filtros combinados: envia nome, status e excluidos juntos', async () => {
    listar(paginado([fazerProduto()]))
    renderComProviders(<ProdutosPage />, '/produtos')
    await screen.findByText('Produto A')

    await userEvent.type(screen.getByLabelText('Nome'), 'cadeira')
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'Inativo')
    await userEvent.click(screen.getByLabelText('Mostrar apenas excluídos'))

    await waitFor(() => {
      const ultima = requisicoes.at(-1)
      expect(ultima?.searchParams.get('nome')).toBe('cadeira')
      expect(ultima?.searchParams.get('status')).toBe('Inativo')
      expect(ultima?.searchParams.get('excluidos')).toBe('true')
    })
  })

  it('invalida a listagem após uma ação (reflete sem reload)', async () => {
    const user = userEvent.setup()
    listar(paginado([fazerProduto({ nome: 'Cadeira Gamer' })]))
    server.use(
      http.delete('*/produtos/:id', () =>
        HttpResponse.json({ data: fazerProduto({ nome: 'Cadeira Gamer', excluido: true }) }),
      ),
    )
    renderComProviders(<ProdutosPage />, '/produtos')
    await screen.findByText('Cadeira Gamer')
    const getsAntes = requisicoes.length

    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    const dialogo = screen.getByRole('dialog')
    await user.click(within(dialogo).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(requisicoes.length).toBeGreaterThan(getsAntes))
  })

  it('exibe o badge de status na linha', async () => {
    listar(paginado([fazerProduto({ nome: 'Produto A', status: 'Inativo' })]))
    renderComProviders(<ProdutosPage />, '/produtos')
    const linha = (await screen.findByText('Produto A')).closest('tr')
    expect(within(linha as HTMLElement).getByText('Inativo')).toHaveAttribute(
      'data-variant',
      'inativo',
    )
  })
})
