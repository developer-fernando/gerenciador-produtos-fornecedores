import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { AcoesPermitidas } from '../types'
import { fazerEmpresa } from '../../../test/fixtures'
import { renderComProviders } from '../../../test/utils'
import { AcoesEmpresa } from './AcoesEmpresa'

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

describe('AcoesEmpresa — visibilidade condicional (docs/15 §Derivação)', () => {
  it('ativa, não excluída → editar/inativar/excluir', () => {
    renderComProviders(
      <AcoesEmpresa
        empresa={fazerEmpresa({
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

  it('inativa, não excluída → editar/reativar/excluir (cobre reativar=true)', () => {
    renderComProviders(
      <AcoesEmpresa
        empresa={fazerEmpresa({
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

  it('excluída sem produtos → restaurar/excluir definitivamente', () => {
    renderComProviders(
      <AcoesEmpresa
        empresa={fazerEmpresa({
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

  it('excluída com produtos → só restaurar (excluir_definitivamente=false)', () => {
    renderComProviders(
      <AcoesEmpresa
        empresa={fazerEmpresa({
          excluido: true,
          produtos_count: 2,
          acoes_permitidas: acoes({ restaurar: true, excluir_definitivamente: false }),
        })}
        onEditar={vi.fn()}
      />,
    )
    expect(btn('Restaurar')).toBeInTheDocument()
    expect(btn('Excluir definitivamente')).not.toBeInTheDocument()
  })
})

describe('AcoesEmpresa — fluxos destrutivos', () => {
  it('inativar exibe o aviso de impacto com a contagem de produtos', async () => {
    const user = userEvent.setup()
    renderComProviders(
      <AcoesEmpresa
        empresa={fazerEmpresa({
          produtos_count: 4,
          acoes_permitidas: acoes({ inativar: true }),
        })}
        onEditar={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Inativar' }))
    expect(
      await screen.findByText('Os 4 produto(s) vinculados também serão inativados.'),
    ).toBeInTheDocument()
  })

  it('excluir definitivamente pede confirmação e mostra o 409 do servidor', async () => {
    const user = userEvent.setup()
    server.use(
      http.delete('*/empresas/:id/forcar', () =>
        HttpResponse.json(
          {
            message: 'Não é possível excluir definitivamente a empresa: há produtos vinculados.',
            code: 'empresa_com_produtos_vinculados',
          },
          { status: 409 },
        ),
      ),
    )
    renderComProviders(
      <AcoesEmpresa
        empresa={fazerEmpresa({
          excluido: true,
          acoes_permitidas: acoes({ excluir_definitivamente: true }),
        })}
        onEditar={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Excluir definitivamente' }))
    // Aviso de irreversibilidade no diálogo.
    const dialogo = screen.getByRole('dialog')
    expect(within(dialogo).getByText(/irreversível/i)).toBeInTheDocument()
    // Confirma (botão dentro do diálogo) → 409 → mensagem compreensível (toast).
    await user.click(within(dialogo).getByRole('button', { name: 'Excluir definitivamente' }))
    expect(await screen.findByText(/há produtos vinculados/i)).toBeInTheDocument()
  })
})
