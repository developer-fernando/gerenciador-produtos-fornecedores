import { http } from '../../lib/http'
import type { Paginated, Status } from '../../shared/types'
import type { EmpresaResumo, Produto, ProdutoFiltros, ProdutoFormInput } from './types'

const BASE = '/produtos'

function montarParams(filtros: ProdutoFiltros): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filtros.page && filtros.page > 1) params.page = filtros.page
  if (filtros.nome && filtros.nome.trim() !== '') params.nome = filtros.nome.trim()
  if (filtros.status) params.status = filtros.status
  if (filtros.excluidos) params.excluidos = 'true'
  return params
}

export async function listarProdutos(filtros: ProdutoFiltros): Promise<Paginated<Produto>> {
  const { data } = await http.get<Paginated<Produto>>(BASE, { params: montarParams(filtros) })
  return data
}

export async function criarProduto(input: ProdutoFormInput): Promise<Produto> {
  const { data } = await http.post<{ data: Produto }>(BASE, input)
  return data.data
}

export async function atualizarProduto(id: number, input: ProdutoFormInput): Promise<Produto> {
  const { data } = await http.put<{ data: Produto }>(`${BASE}/${id}`, input)
  return data.data
}

export async function inativarProduto(id: number): Promise<Produto> {
  const { data } = await http.patch<{ data: Produto }>(`${BASE}/${id}/inativar`)
  return data.data
}

export async function reativarProduto(id: number): Promise<Produto> {
  const { data } = await http.patch<{ data: Produto }>(`${BASE}/${id}/reativar`)
  return data.data
}

export async function excluirProduto(id: number): Promise<Produto> {
  const { data } = await http.delete<{ data: Produto }>(`${BASE}/${id}`)
  return data.data
}

export async function restaurarProduto(id: number): Promise<Produto> {
  const { data } = await http.post<{ data: Produto }>(`${BASE}/${id}/restaurar`)
  return data.data
}

export async function forcarProduto(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}/forcar`)
}

type EmpresaAptaPag = Paginated<{ id: number; nome: string; status: Status }>

/**
 * Empresas aptas (ativas e não excluídas) para o seletor do formulário.
 * Como `GET /empresas` é paginado (10/pág, sem `per_page` no contrato — docs/15),
 * itera todas as páginas e concatena, devolvendo a lista completa.
 */
export async function listarEmpresasAptas(): Promise<EmpresaResumo[]> {
  const primeira = await http.get<EmpresaAptaPag>('/empresas', {
    params: { status: 'Ativo', page: 1 },
  })
  let itens = primeira.data.data
  const ultima = primeira.data.meta.last_page
  for (let page = 2; page <= ultima; page++) {
    const resp = await http.get<EmpresaAptaPag>('/empresas', {
      params: { status: 'Ativo', page },
    })
    itens = itens.concat(resp.data.data)
  }
  return itens.map((e) => ({ id: e.id, nome: e.nome, status: e.status }))
}
