import type { Empresa, AcoesPermitidas } from '../features/empresas/types'
import type { Paginated } from '../shared/types'

const ACOES_ATIVA: AcoesPermitidas = {
  editar: true,
  inativar: true,
  reativar: false,
  excluir: true,
  restaurar: false,
  excluir_definitivamente: false,
}

/** Cria uma Empresa de teste, permitindo sobrescrever campos. */
export function fazerEmpresa(over: Partial<Empresa> = {}): Empresa {
  return {
    id: 1,
    nome: 'Fornecedor Exemplo Ltda',
    cnpj: '12345678000199',
    email: 'contato@exemplo.com',
    telefone: '11912345678',
    status: 'Ativo',
    excluido: false,
    produtos_count: 0,
    created_at: '2026-09-04T12:00:00Z',
    updated_at: '2026-09-04T12:00:00Z',
    deleted_at: null,
    acoes_permitidas: { ...ACOES_ATIVA },
    ...over,
  }
}

/** Envelope paginado padrão do Laravel para uma lista de itens. */
export function paginado<T>(
  itens: T[],
  meta: Partial<Paginated<T>['meta']> = {},
): Paginated<T> {
  const current_page = meta.current_page ?? 1
  const total = meta.total ?? itens.length
  const per_page = meta.per_page ?? 10
  const last_page = meta.last_page ?? Math.max(1, Math.ceil(total / per_page))
  return {
    data: itens,
    links: { first: '', last: '', prev: null, next: null },
    meta: {
      current_page,
      per_page,
      total,
      last_page,
      from: itens.length ? 1 : null,
      to: itens.length || null,
      path: 'http://localhost/api/empresas',
      ...meta,
    },
  }
}
