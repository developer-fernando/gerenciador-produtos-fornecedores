import type { ProdutoFormInput } from './types'

export type ErrosProduto = Partial<Record<keyof ProdutoFormInput, string>>

/**
 * Validação de formulário (apenas UX — o servidor é a autoridade).
 * Espelha as regras de docs/03 para feedback imediato antes do POST/PUT.
 */
export function validarProduto(input: ProdutoFormInput): ErrosProduto {
  const erros: ErrosProduto = {}

  if (input.empresa_id === '' || !input.empresa_id) {
    erros.empresa_id = 'Selecione uma empresa.'
  }

  const nome = input.nome.trim()
  if (nome.length < 3 || nome.length > 150) {
    erros.nome = 'O nome deve ter entre 3 e 150 caracteres.'
  }

  if (input.descricao.length > 2000) {
    erros.descricao = 'A descrição deve ter no máximo 2000 caracteres.'
  }

  const precoTexto = String(input.preco).trim().replace(',', '.')
  const preco = Number(precoTexto)
  if (!Number.isFinite(preco) || preco <= 0) {
    erros.preco = 'Informe um preço maior que zero.'
  } else if (!/^\d+(\.\d{1,2})?$/.test(precoTexto)) {
    erros.preco = 'Use no máximo 2 casas decimais.'
  }

  if (input.codigo_interno.trim() === '') {
    erros.codigo_interno = 'Informe o código interno.'
  }

  if (input.status !== 'Ativo' && input.status !== 'Inativo') {
    erros.status = 'Selecione um status válido.'
  }

  return erros
}
