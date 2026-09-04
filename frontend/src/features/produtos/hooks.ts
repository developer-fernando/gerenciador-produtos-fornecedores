import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Paginated } from '../../shared/types'
import {
  atualizarProduto,
  criarProduto,
  excluirProduto,
  forcarProduto,
  inativarProduto,
  listarEmpresasAptas,
  listarProdutos,
  reativarProduto,
  restaurarProduto,
} from './api'
import type { EmpresaResumo, Produto, ProdutoFiltros, ProdutoFormInput } from './types'

export const produtosKeys = {
  all: ['produtos'] as const,
  list: (filtros: ProdutoFiltros) => ['produtos', 'list', filtros] as const,
}

/** Listagem paginada de produtos; mantém os dados anteriores ao trocar de página. */
export function useProdutos(filtros: ProdutoFiltros) {
  return useQuery<Paginated<Produto>>({
    queryKey: produtosKeys.list(filtros),
    queryFn: () => listarProdutos(filtros),
    placeholderData: keepPreviousData,
  })
}

/** Empresas aptas (todas as páginas) para o seletor do formulário. */
export function useEmpresasAptas() {
  return useQuery<EmpresaResumo[]>({
    queryKey: ['empresas', 'aptas'],
    queryFn: listarEmpresasAptas,
    staleTime: 30_000,
  })
}

/**
 * Mutações de Produto. Cada uma, ao concluir, **invalida** as listagens
 * (`['produtos']`), fazendo a UI refletir o novo estado sem reload (docs/10).
 */
export function useProdutoMutations() {
  const qc = useQueryClient()
  const invalidar = () => qc.invalidateQueries({ queryKey: produtosKeys.all })

  const criar = useMutation({
    mutationFn: (input: ProdutoFormInput) => criarProduto(input),
    onSuccess: invalidar,
  })

  const atualizar = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProdutoFormInput }) =>
      atualizarProduto(id, input),
    onSuccess: invalidar,
  })

  const inativar = useMutation({
    mutationFn: (id: number) => inativarProduto(id),
    onSuccess: invalidar,
  })

  const reativar = useMutation({
    mutationFn: (id: number) => reativarProduto(id),
    onSuccess: invalidar,
  })

  const excluir = useMutation({
    mutationFn: (id: number) => excluirProduto(id),
    onSuccess: invalidar,
  })

  const restaurar = useMutation({
    mutationFn: (id: number) => restaurarProduto(id),
    onSuccess: invalidar,
  })

  const forcar = useMutation({
    mutationFn: (id: number) => forcarProduto(id),
    onSuccess: invalidar,
  })

  return { criar, atualizar, inativar, reativar, excluir, restaurar, forcar }
}
