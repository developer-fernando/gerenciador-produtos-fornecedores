import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { fazerProduto, paginado } from '../../../test/fixtures'
import { renderComProviders } from '../../../test/utils'
import { ProdutoFormModal } from './ProdutoFormModal'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Sempre serve algumas empresas aptas para o seletor.
function servirAptas() {
  server.use(
    http.get('*/empresas', () =>
      HttpResponse.json(
        paginado([
          { id: 1, nome: 'Empresa Um', status: 'Ativo' },
          { id: 2, nome: 'Empresa Dois', status: 'Ativo' },
        ]),
      ),
    ),
  )
}

async function preencherValido(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(await screen.findByLabelText('Empresa'), '1')
  await user.type(screen.getByLabelText('Nome'), 'Produto Novo')
  await user.type(screen.getByLabelText('Preço (R$)'), '19.90')
  await user.type(screen.getByLabelText('Código interno'), 'SKU-999')
}

describe('ProdutoFormModal', () => {
  it('mapeia erros 422 do servidor para os campos (codigo_interno e preco)', async () => {
    const user = userEvent.setup()
    servirAptas()
    server.use(
      http.post('*/produtos', () =>
        HttpResponse.json(
          {
            message: 'Os dados informados são inválidos.',
            errors: {
              codigo_interno: ['Este código já existe nesta empresa.'],
              preco: ['O preço deve ser maior que zero.'],
            },
          },
          { status: 422 },
        ),
      ),
    )

    renderComProviders(<ProdutoFormModal onClose={vi.fn()} />, '/produtos')
    await preencherValido(user)
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Este código já existe nesta empresa.'),
    ).toBeInTheDocument()
    expect(screen.getByText('O preço deve ser maior que zero.')).toBeInTheDocument()
    expect(screen.getByLabelText('Código interno')).toHaveAttribute('aria-invalid', 'true')
  })

  it('valida no cliente e não chama a API quando inválido', async () => {
    const user = userEvent.setup()
    servirAptas()
    let chamou = false
    server.use(
      http.post('*/produtos', () => {
        chamou = true
        return HttpResponse.json({ data: fazerProduto() }, { status: 201 })
      }),
    )

    renderComProviders(<ProdutoFormModal onClose={vi.fn()} />, '/produtos')
    // Submete sem empresa/nome/preço/código.
    await user.click(await screen.findByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Selecione uma empresa.')).toBeInTheDocument()
    expect(screen.getByText('Informe o código interno.')).toBeInTheDocument()
    expect(chamou).toBe(false)
  })

  it('submit válido cria o produto e fecha o modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    servirAptas()
    server.use(
      http.post('*/produtos', () =>
        HttpResponse.json({ data: fazerProduto({ nome: 'Produto Novo' }) }, { status: 201 }),
      ),
    )

    renderComProviders(<ProdutoFormModal onClose={onClose} />, '/produtos')
    await preencherValido(user)
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
