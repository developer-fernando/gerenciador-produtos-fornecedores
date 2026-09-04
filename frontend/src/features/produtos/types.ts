import type { AcoesPermitidas, Status } from '../../shared/types'

/** Resumo da empresa vinculada (eager loading no recurso de produto — docs/15). */
export interface EmpresaResumo {
  id: number
  nome: string
  status: Status
}

/** Produto, espelhando o recurso da API (docs/15). `preco` é string decimal. */
export interface Produto {
  id: number
  empresa_id: number
  empresa: EmpresaResumo
  nome: string
  descricao: string | null
  preco: string
  codigo_interno: string
  status: Status
  excluido: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  acoes_permitidas: AcoesPermitidas
}

/** Filtros da listagem (query params — docs/15). */
export interface ProdutoFiltros {
  page?: number
  nome?: string
  status?: Status | ''
  excluidos?: boolean
}

/** Corpo de criação/edição de produto. */
export interface ProdutoFormInput {
  empresa_id: number | ''
  nome: string
  descricao: string
  preco: string
  codigo_interno: string
  status: Status
}
