// Formatadores de exibição. A API retorna cnpj/telefone só com dígitos e
// preço como string decimal; a formatação para o usuário é do front (docs/15).

/** Mantém apenas os dígitos de uma string. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/** 14 dígitos → "12.345.678/0001-99". Fora disso, devolve a entrada. */
export function formatarCnpj(cnpj: string): string {
  const d = apenasDigitos(cnpj)
  if (d.length !== 14) return cnpj
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

/** 10 dígitos → "(11) 2345-6789"; 11 → "(11) 91234-5678". Fora disso, a entrada. */
export function formatarTelefone(telefone: string): string {
  const d = apenasDigitos(telefone)
  if (d.length === 11) {
    return d.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }
  if (d.length === 10) {
    return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  }
  return telefone
}

const MOEDA_BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** Preço (string decimal "99.90" ou number) → "R$ 99,90". Inválido → "R$ 0,00". */
export function formatarPreco(preco: string | number): string {
  const numero = typeof preco === 'number' ? preco : Number(preco)
  return MOEDA_BRL.format(Number.isFinite(numero) ? numero : 0)
}
