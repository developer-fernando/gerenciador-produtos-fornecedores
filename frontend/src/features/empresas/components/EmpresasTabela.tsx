import type { ReactNode } from 'react'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { Table } from '../../../shared/components/Table'
import { formatarCnpj, formatarTelefone } from '../../../shared/format'
import type { Empresa } from '../types'
import styles from './EmpresasTabela.module.css'

/**
 * Tabela de empresas. Exibe CNPJ/telefone formatados, o badge de status
 * (com precedência de "Excluído") e a contagem de produtos. A coluna de ações
 * é preenchida via `acoesSlot` (04-T8); sem ele, a coluna não aparece.
 */
export function EmpresasTabela({
  empresas,
  acoesSlot,
}: {
  empresas: Empresa[]
  acoesSlot?: (empresa: Empresa) => ReactNode
}) {
  const temAcoes = Boolean(acoesSlot)

  return (
    <Table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>CNPJ</th>
          <th>E-mail</th>
          <th>Telefone</th>
          <th>Status</th>
          <th className={styles.produtos}>Produtos</th>
          {temAcoes && <th className={styles.acoes}>Ações</th>}
        </tr>
      </thead>
      <tbody>
        {empresas.map((empresa) => (
          <tr key={empresa.id}>
            <td className={styles.nome}>{empresa.nome}</td>
            <td className={styles.mono}>{formatarCnpj(empresa.cnpj)}</td>
            <td>{empresa.email}</td>
            <td className={styles.mono}>{formatarTelefone(empresa.telefone)}</td>
            <td>
              <StatusBadge status={empresa.status} excluido={empresa.excluido} />
            </td>
            <td className={styles.produtos}>{empresa.produtos_count}</td>
            {temAcoes && <td className={styles.acoes}>{acoesSlot?.(empresa)}</td>}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
