import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { fazerEmpresa } from '../../../test/fixtures'
import { renderComProviders } from '../../../test/utils'
import { EmpresaFormModal } from './EmpresaFormModal'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Dados válidos para preencher o formulário sem barrar na validação de UX.
async function preencherValido(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome'), 'Fornecedor Novo Ltda')
  await user.type(screen.getByLabelText('CNPJ'), '12345678000199')
  await user.type(screen.getByLabelText('E-mail'), 'novo@exemplo.com')
  await user.type(screen.getByLabelText('Telefone'), '11912345678')
}

describe('EmpresaFormModal', () => {
  it('mapeia o erro 422 do servidor para o campo (cnpj)', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/empresas', () =>
        HttpResponse.json(
          {
            message: 'Os dados informados são inválidos.',
            errors: { cnpj: ['Este CNPJ já está cadastrado.'] },
          },
          { status: 422 },
        ),
      ),
    )

    renderComProviders(<EmpresaFormModal onClose={vi.fn()} />)
    await preencherValido(user)
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    const erro = await screen.findByText('Este CNPJ já está cadastrado.')
    expect(erro).toBeInTheDocument()
    // O erro fica amarrado ao campo CNPJ via aria-describedby.
    const cnpj = screen.getByLabelText('CNPJ')
    expect(cnpj).toHaveAttribute('aria-invalid', 'true')
    expect(cnpj).toHaveAttribute('aria-describedby', erro.id)
  })

  it('mostra os erros de validação de UX sem chamar a API', async () => {
    const user = userEvent.setup()
    let chamou = false
    server.use(
      http.post('*/empresas', () => {
        chamou = true
        return HttpResponse.json({ data: fazerEmpresa() }, { status: 201 })
      }),
    )

    renderComProviders(<EmpresaFormModal onClose={vi.fn()} />)
    // Submete vazio → validação local barra.
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('O CNPJ deve ter 14 dígitos.')).toBeInTheDocument()
    expect(chamou).toBe(false)
  })

  it('submit válido cria a empresa e fecha o modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    server.use(
      http.post('*/empresas', () =>
        HttpResponse.json({ data: fazerEmpresa({ nome: 'Fornecedor Novo Ltda' }) }, { status: 201 }),
      ),
    )

    renderComProviders(<EmpresaFormModal onClose={onClose} />)
    await preencherValido(user)
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
