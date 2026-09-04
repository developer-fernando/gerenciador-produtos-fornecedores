import type { Empresa } from '../features/empresas/types'
import type { Produto } from '../features/produtos/types'
import type { AcoesPermitidas, Paginated } from '../shared/types'

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

/** Cria um Produto de teste, permitindo sobrescrever campos. */
export function fazerProduto(over: Partial<Produto> = {}): Produto {
  return {
    id: 10,
    empresa_id: 1,
    empresa: { id: 1, nome: 'Fornecedor Exemplo Ltda', status: 'Ativo' },
    nome: 'Produto A',
    descricao: 'Descrição opcional',
    preco: '99.90',
    codigo_interno: 'SKU-001',
    status: 'Ativo',
    excluido: false,
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
