import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { AcoesPermitidas } from '../../../shared/types'
import { fazerProduto } from '../../../test/fixtures'
import { renderComProviders } from '../../../test/utils'
import { AcoesProduto } from './AcoesProduto'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function acoes(over: Partial<AcoesPermitidas>): AcoesPermitidas {
  return {
    editar: false,
    inativar: false,
    reativar: false,
    excluir: false,
    restaurar: false,
    excluir_definitivamente: false,
    ...over,
  }
}

const btn = (nome: string) => screen.queryByRole('button', { name: nome })

describe('AcoesProduto — visibilidade condicional (docs/15 §Derivação)', () => {
  it('ativo, empresa apta → editar/inativar/excluir', () => {
    renderComProviders(
      <AcoesProduto
        produto={fazerProduto({
          status: 'Ativo',
          excluido: false,
          acoes_permitidas: acoes({ editar: true, inativar: true, excluir: true }),
        })}
        onEditar={vi.fn()}
      />,
    )
    expect(btn('Editar')).toBeInTheDocument()
    expect(btn('Inativar')).toBeInTheDocument()
    expect(btn('Excluir')).toBeInTheDocument()
    expect(btn('Reativar')).not.toBeInTheDocument()
    expect(btn('Restaurar')).not.toBeInTheDocument()
  })

  it('inativo, empresa apta → editar/reativar/excluir (cobre reativar=true)', () => {
    renderComProviders(
      <AcoesProduto
        produto={fazerProduto({
          status: 'Inativo',
          excluido: false,
          acoes_permitidas: acoes({ editar: true, reativar: true, excluir: true }),
        })}
        onEditar={vi.fn()}
      />,
    )
    expect(btn('Editar')).toBeInTheDocument()
    expect(btn('Reativar')).toBeInTheDocument()
    expect(btn('Excluir')).toBeInTheDocument()
    expect(btn('Inativar')).not.toBeInTheDocument()
  })

  it('inativo, empresa não apta → sem editar/reativar', () => {
    renderComProviders(
      <AcoesProduto
        produto={fazerProduto({
          status: 'Inativo',
          excluido: false,
          empresa: { id: 1, nome: 'Inativa Ltda', status: 'Inativo' },
          acoes_permitidas: acoes({ editar: false, reativar: false, excluir: true }),
        })}
        onEditar={vi.fn()}
      />,
    )
    expect(btn('Editar')).not.toBeInTheDocument()
    expect(btn('Reativar')).not.toBeInTheDocument()
    expect(btn('Excluir')).toBeInTheDocument()
  })

  it('excluído → restaurar/excluir definitivamente', () => {
    renderComProviders(
      <AcoesProduto
        produto={fazerProduto({
          excluido: true,
          acoes_permitidas: acoes({ restaurar: true, excluir_definitivamente: true }),
        })}
        onEditar={vi.fn()}
      />,
    )
    expect(btn('Restaurar')).toBeInTheDocument()
    expect(btn('Excluir definitivamente')).toBeInTheDocument()
    expect(btn('Editar')).not.toBeInTheDocument()
  })
})

describe('AcoesProduto — fluxos destrutivos e regras de servidor', () => {
  it('excluir definitivamente pede confirmação e mostra aviso de irreversibilidade', async () => {
    const user = userEvent.setup()
    server.use(http.delete('*/produtos/:id/forcar', () => new HttpResponse(null, { status: 204 })))
    renderComProviders(
      <AcoesProduto
        produto={fazerProduto({
          excluido: true,
          acoes_permitidas: acoes({ excluir_definitivamente: true }),
        })}
        onEditar={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Excluir definitivamente' }))
    const dialogo = screen.getByRole('dialog')
    expect(within(dialogo).getByText(/irreversível/i)).toBeInTheDocument()
    await user.click(within(dialogo).getByRole('button', { name: 'Excluir definitivamente' }))
    expect(await screen.findByText('Produto excluído definitivamente.')).toBeInTheDocument()
  })

  it('restaurar com empresa excluída (409) mostra a mensagem do servidor', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/produtos/:id/restaurar', () =>
        HttpResponse.json(
          {
            message:
              'Não é possível restaurar o produto: a empresa vinculada está excluída. Restaure a empresa antes.',
            code: 'empresa_excluida',
          },
          { status: 409 },
        ),
      ),
    )
    renderComProviders(
      <AcoesProduto
        produto={fazerProduto({
          excluido: true,
          acoes_permitidas: acoes({ restaurar: true }),
        })}
        onEditar={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Restaurar' }))
    expect(await screen.findByText(/empresa vinculada está excluída/i)).toBeInTheDocument()
  })

  it('reativar com empresa não apta (422) mostra a mensagem do servidor', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch('*/produtos/:id/reativar', () =>
        HttpResponse.json(
          {
            message: 'A empresa vinculada deve estar ativa e não excluída.',
            code: 'empresa_inativa_ou_excluida',
          },
          { status: 422 },
        ),
      ),
    )
    renderComProviders(
      <AcoesProduto
        produto={fazerProduto({
          status: 'Inativo',
          acoes_permitidas: acoes({ reativar: true }),
        })}
        onEditar={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Reativar' }))
    expect(await screen.findByText(/ativa e não excluída/i)).toBeInTheDocument()
  })
})
