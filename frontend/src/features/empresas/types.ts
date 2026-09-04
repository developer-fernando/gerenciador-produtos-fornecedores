import type { AcoesPermitidas, Status } from '../../shared/types'

// `AcoesPermitidas` agora vive em `shared/` (usado por Empresa e Produto);
// re-exportado aqui para compatibilidade com quem já importa de `../types`.
export type { AcoesPermitidas }

/** Empresa, espelhando o recurso da API (docs/15). cnpj/telefone só com dígitos. */
export interface Empresa {
  id: number
  nome: string
  cnpj: string
  email: string
  telefone: string
  status: Status
  excluido: boolean
  produtos_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  acoes_permitidas: AcoesPermitidas
}

/** Filtros da listagem (query params — docs/15). */
export interface EmpresaFiltros {
  page?: number
  nome?: string
  status?: Status | ''
  excluidos?: boolean
}

/** Corpo de criação/edição (cnpj/telefone podem ir formatados; o back normaliza). */
export interface EmpresaFormInput {
  nome: string
  cnpj: string
  email: string
  telefone: string
  status: Status
}
