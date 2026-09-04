import { apenasDigitos } from '../../shared/format'
import type { EmpresaFormInput } from './types'

export type ErrosEmpresa = Partial<Record<keyof EmpresaFormInput, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validação de formulário (apenas UX — o servidor é a autoridade, docs/AGENTS).
 * Espelha as regras de docs/03 para dar feedback imediato antes do POST/PUT.
 */
export function validarEmpresa(input: EmpresaFormInput): ErrosEmpresa {
  const erros: ErrosEmpresa = {}

  const nome = input.nome.trim()
  if (nome.length < 3 || nome.length > 150) {
    erros.nome = 'O nome deve ter entre 3 e 150 caracteres.'
  }

  const cnpj = apenasDigitos(input.cnpj)
  if (cnpj.length !== 14) {
    erros.cnpj = 'O CNPJ deve ter 14 dígitos.'
  }

  if (!EMAIL_RE.test(input.email.trim())) {
    erros.email = 'Informe um e-mail válido.'
  }

  const telefone = apenasDigitos(input.telefone)
  if (telefone.length < 10 || telefone.length > 11) {
    erros.telefone = 'Informe um telefone com DDD (10 ou 11 dígitos).'
  }

  if (input.status !== 'Ativo' && input.status !== 'Inativo') {
    erros.status = 'Selecione um status válido.'
  }

  return erros
}
