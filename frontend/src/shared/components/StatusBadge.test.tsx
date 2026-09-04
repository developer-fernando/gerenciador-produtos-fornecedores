import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('Ativo (não excluído) → rótulo e variante "ativo"', () => {
    render(<StatusBadge status="Ativo" excluido={false} />)
    const badge = screen.getByText('Ativo')
    expect(badge).toHaveAttribute('data-variant', 'ativo')
  })

  it('Inativo (não excluído) → rótulo e variante "inativo"', () => {
    render(<StatusBadge status="Inativo" excluido={false} />)
    const badge = screen.getByText('Inativo')
    expect(badge).toHaveAttribute('data-variant', 'inativo')
  })

  it('Excluído (status Ativo) → precedência de "Excluído"', () => {
    render(<StatusBadge status="Ativo" excluido={true} />)
    const badge = screen.getByText('Excluído')
    expect(badge).toHaveAttribute('data-variant', 'excluido')
    expect(screen.queryByText('Ativo')).not.toBeInTheDocument()
  })

  it('caso combinado Inativo + Excluído → mostra "Excluído", nunca "Inativo" (F4)', () => {
    render(<StatusBadge status="Inativo" excluido={true} />)
    const badge = screen.getByText('Excluído')
    expect(badge).toHaveAttribute('data-variant', 'excluido')
    // Não pode conflar as dimensões: um registro excluído não é rotulado "Inativo".
    expect(screen.queryByText('Inativo')).not.toBeInTheDocument()
  })
})
