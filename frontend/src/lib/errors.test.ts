import { describe, expect, it } from 'vitest'
import {
  ehApiError,
  MENSAGEM_GENERICA,
  MENSAGEM_REDE,
  normalizarErro,
} from './errors'

// Cria um erro no formato do axios (isAxiosError === true) para os testes.
function erroAxios(status: number | null, data?: unknown) {
  return {
    isAxiosError: true,
    response: status === null ? undefined : { status, data },
  }
}

describe('normalizarErro', () => {
  it('422 de validação → mapeia errors para fieldErrors (1 msg por campo)', () => {
    const erro = erroAxios(422, {
      message: 'Os dados informados são inválidos.',
      errors: {
        cnpj: ['Este CNPJ já está cadastrado.'],
        preco: ['O preço deve ser maior que zero.'],
      },
    })
    const api = normalizarErro(erro)
    expect(api.status).toBe(422)
    expect(api.message).toBe('Os dados informados são inválidos.')
    expect(api.fieldErrors).toEqual({
      cnpj: 'Este CNPJ já está cadastrado.',
      preco: 'O preço deve ser maior que zero.',
    })
    expect(api.code).toBeUndefined()
  })

  it('409 de regra de negócio → preserva message e code, sem fieldErrors', () => {
    const erro = erroAxios(409, {
      message: 'Não é possível excluir definitivamente a empresa: há produtos vinculados.',
      code: 'empresa_com_produtos_vinculados',
    })
    const api = normalizarErro(erro)
    expect(api.status).toBe(409)
    expect(api.code).toBe('empresa_com_produtos_vinculados')
    expect(api.message).toContain('produtos vinculados')
    expect(api.fieldErrors).toBeUndefined()
  })

  it('422 de regra de negócio (com code) → expõe o code', () => {
    const erro = erroAxios(422, {
      message: 'A empresa selecionada não está apta.',
      code: 'empresa_inativa_ou_excluida',
    })
    const api = normalizarErro(erro)
    expect(api.status).toBe(422)
    expect(api.code).toBe('empresa_inativa_ou_excluida')
    expect(api.fieldErrors).toBeUndefined()
  })

  it('404 → usa a message do servidor', () => {
    const api = normalizarErro(erroAxios(404, { message: 'Registro não encontrado.' }))
    expect(api.status).toBe(404)
    expect(api.message).toBe('Registro não encontrado.')
  })

  it('404 sem corpo → mensagem padrão de não encontrado', () => {
    const api = normalizarErro(erroAxios(404, {}))
    expect(api.status).toBe(404)
    expect(api.message).toBe('Registro não encontrado.')
  })

  it('500 → mensagem genérica, sem vazar detalhes', () => {
    const api = normalizarErro(
      erroAxios(500, { message: 'Ocorreu um erro inesperado. Tente novamente.' }),
    )
    expect(api.status).toBe(500)
    expect(api.message).toBe('Ocorreu um erro inesperado. Tente novamente.')
    expect(api.code).toBeUndefined()
    expect(api.fieldErrors).toBeUndefined()
  })

  it('falha de rede (sem response) → status 0 e mensagem de rede', () => {
    const api = normalizarErro(erroAxios(null))
    expect(api.status).toBe(0)
    expect(api.message).toBe(MENSAGEM_REDE)
  })

  it('erro não-axios → mensagem genérica', () => {
    const api = normalizarErro(new Error('boom'))
    expect(api.status).toBe(0)
    expect(api.message).toBe(MENSAGEM_GENERICA)
  })
})

describe('ehApiError', () => {
  it('reconhece um ApiError normalizado', () => {
    expect(ehApiError({ status: 409, message: 'x' })).toBe(true)
  })
  it('rejeita valores que não são ApiError', () => {
    expect(ehApiError(null)).toBe(false)
    expect(ehApiError({ status: 1 })).toBe(false)
    expect(ehApiError('erro')).toBe(false)
  })
})
