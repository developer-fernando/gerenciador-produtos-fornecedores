// Tipos compartilhados entre as features.

/** Status de um registro (dimensão independente da exclusão lógica). */
export type Status = 'Ativo' | 'Inativo'

/** Metadados de paginação do envelope do Laravel (docs/15). */
export interface PageMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
  path: string
}

export interface PageLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

/** Resposta paginada padrão (`paginate()` do Laravel). */
export interface Paginated<T> {
  data: T[]
  links: PageLinks
  meta: PageMeta
}
