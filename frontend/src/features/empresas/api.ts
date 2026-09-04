import { http } from '../../lib/http'
import type { Paginated } from '../../shared/types'
import type { Empresa, EmpresaFiltros, EmpresaFormInput } from './types'

const BASE = '/empresas'

/** Monta os query params, omitindo vazios; `excluidos` só quando true. */
function montarParams(filtros: EmpresaFiltros): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filtros.page && filtros.page > 1) params.page = filtros.page
  if (filtros.nome && filtros.nome.trim() !== '') params.nome = filtros.nome.trim()
  if (filtros.status) params.status = filtros.status
  if (filtros.excluidos) params.excluidos = 'true'
  return params
}

export async function listarEmpresas(filtros: EmpresaFiltros): Promise<Paginated<Empresa>> {
  const { data } = await http.get<Paginated<Empresa>>(BASE, { params: montarParams(filtros) })
  return data
}

export async function buscarEmpresa(id: number): Promise<Empresa> {
  const { data } = await http.get<{ data: Empresa }>(`${BASE}/${id}`)
  return data.data
}

export async function criarEmpresa(input: EmpresaFormInput): Promise<Empresa> {
  const { data } = await http.post<{ data: Empresa }>(BASE, input)
  return data.data
}

export async function atualizarEmpresa(
  id: number,
  input: EmpresaFormInput,
): Promise<Empresa> {
  const { data } = await http.put<{ data: Empresa }>(`${BASE}/${id}`, input)
  return data.data
}

export async function inativarEmpresa(id: number): Promise<Empresa> {
  const { data } = await http.patch<{ data: Empresa }>(`${BASE}/${id}/inativar`)
  return data.data
}

export async function reativarEmpresa(id: number): Promise<Empresa> {
  const { data } = await http.patch<{ data: Empresa }>(`${BASE}/${id}/reativar`)
  return data.data
}

export async function excluirEmpresa(id: number): Promise<Empresa> {
  const { data } = await http.delete<{ data: Empresa }>(`${BASE}/${id}`)
  return data.data
}

export async function restaurarEmpresa(id: number): Promise<Empresa> {
  const { data } = await http.post<{ data: Empresa }>(`${BASE}/${id}/restaurar`)
  return data.data
}

/** Exclusão física (204, sem corpo). */
export async function forcarEmpresa(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}/forcar`)
}
