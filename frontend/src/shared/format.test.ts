import { describe, expect, it } from 'vitest'
import { formatarCnpj, formatarPreco, formatarTelefone } from './format'

// Normaliza qualquer espaço (Intl usa NBSP/narrow-NBSP no BRL) para comparar.
const norm = (s: string) => s.replace(/\s/g, ' ')

describe('formatarCnpj', () => {
  it('formata 14 dígitos com máscara', () => {
    expect(formatarCnpj('12345678000199')).toBe('12.345.678/0001-99')
  })
  it('devolve a entrada quando não tem 14 dígitos', () => {
    expect(formatarCnpj('123')).toBe('123')
  })
})

describe('formatarTelefone', () => {
  it('formata celular (11 dígitos)', () => {
    expect(formatarTelefone('11912345678')).toBe('(11) 91234-5678')
  })
  it('formata fixo (10 dígitos)', () => {
    expect(formatarTelefone('1123456789')).toBe('(11) 2345-6789')
  })
  it('devolve a entrada com comprimento inesperado', () => {
    expect(formatarTelefone('123')).toBe('123')
  })
})

describe('formatarPreco', () => {
  it('formata string decimal em BRL', () => {
    expect(norm(formatarPreco('99.90'))).toBe('R$ 99,90')
  })
  it('formata number em BRL', () => {
    expect(norm(formatarPreco(1234.5))).toBe('R$ 1.234,50')
  })
  it('valor inválido vira R$ 0,00', () => {
    expect(norm(formatarPreco('abc'))).toBe('R$ 0,00')
  })
})
