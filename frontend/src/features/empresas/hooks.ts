import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Paginated } from '../../shared/types'
import {
  atualizarEmpresa,
  criarEmpresa,
  excluirEmpresa,
  forcarEmpresa,
  inativarEmpresa,
  listarEmpresas,
  reativarEmpresa,
  restaurarEmpresa,
} from './api'
import type { Empresa, EmpresaFiltros, EmpresaFormInput } from './types'

export const empresasKeys = {
  all: ['empresas'] as const,
  list: (filtros: EmpresaFiltros) => ['empresas', 'list', filtros] as const,
}

/** Listagem paginada de empresas; mantém os dados anteriores ao trocar de página. */
export function useEmpresas(filtros: EmpresaFiltros) {
  return useQuery<Paginated<Empresa>>({
    queryKey: empresasKeys.list(filtros),
    queryFn: () => listarEmpresas(filtros),
    placeholderData: keepPreviousData,
  })
}

/**
 * Mutações de Empresa. Cada uma, ao concluir, **invalida** as listagens
 * (`['empresas']`), fazendo a UI refletir o novo estado sem reload (docs/10).
 */
export function useEmpresaMutations() {
  const qc = useQueryClient()
  const invalidar = () => qc.invalidateQueries({ queryKey: empresasKeys.all })

  const criar = useMutation({
    mutationFn: (input: EmpresaFormInput) => criarEmpresa(input),
    onSuccess: invalidar,
  })

  const atualizar = useMutation({
    mutationFn: ({ id, input }: { id: number; input: EmpresaFormInput }) =>
      atualizarEmpresa(id, input),
    onSuccess: invalidar,
  })

  const inativar = useMutation({
    mutationFn: (id: number) => inativarEmpresa(id),
    onSuccess: invalidar,
  })

  const reativar = useMutation({
    mutationFn: (id: number) => reativarEmpresa(id),
    onSuccess: invalidar,
  })

  const excluir = useMutation({
    mutationFn: (id: number) => excluirEmpresa(id),
    onSuccess: invalidar,
  })

  const restaurar = useMutation({
    mutationFn: (id: number) => restaurarEmpresa(id),
    onSuccess: invalidar,
  })

  const forcar = useMutation({
    mutationFn: (id: number) => forcarEmpresa(id),
    onSuccess: invalidar,
  })

  return { criar, atualizar, inativar, reativar, excluir, restaurar, forcar }
}
