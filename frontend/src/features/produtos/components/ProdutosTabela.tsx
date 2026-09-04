import type { ReactNode } from 'react'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { Table } from '../../../shared/components/Table'
import { formatarPreco } from '../../../shared/format'
import type { Produto } from '../types'
import styles from './ProdutosTabela.module.css'

/**
 * Tabela de produtos. Exibe a empresa vinculada, o preço formatado (BRL), o
 * código interno e o badge de status (com precedência de "Excluído"). A coluna
 * de ações é preenchida via `acoesSlot` (05-T5).
 */
export function ProdutosTabela({
  produtos,
  acoesSlot,
}: {
  produtos: Produto[]
  acoesSlot?: (produto: Produto) => ReactNode
}) {
  const temAcoes = Boolean(acoesSlot)

  return (
    <Table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Empresa</th>
          <th className={styles.preco}>Preço</th>
          <th className={styles.codigo}>Código</th>
          <th>Status</th>
          {temAcoes && <th className={styles.acoes}>Ações</th>}
        </tr>
      </thead>
      <tbody>
        {produtos.map((produto) => (
          <tr key={produto.id}>
            <td className={styles.nome}>{produto.nome}</td>
            <td>{produto.empresa.nome}</td>
            <td className={styles.preco}>{formatarPreco(produto.preco)}</td>
            <td className={styles.codigo}>{produto.codigo_interno}</td>
            <td>
              <StatusBadge status={produto.status} excluido={produto.excluido} />
            </td>
            {temAcoes && <td className={styles.acoes}>{acoesSlot?.(produto)}</td>}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
