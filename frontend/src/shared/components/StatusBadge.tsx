import type { Status } from '../types'
import styles from './StatusBadge.module.css'

type Variante = 'ativo' | 'inativo' | 'excluido'

/**
 * Badge do estado do registro. Status e exclusão são dimensões independentes
 * (docs/02 §1) e **não podem ser confundidos** (item eliminatório): quando o
 * registro está excluído, "Excluído" tem **precedência** visual; caso contrário,
 * mostra o status (Ativo/Inativo). Assim a UI nunca rotula de "Inativo" um
 * registro excluído nem vice-versa.
 */
export function StatusBadge({ status, excluido }: { status: Status; excluido: boolean }) {
  const variante: Variante = excluido ? 'excluido' : status === 'Ativo' ? 'ativo' : 'inativo'
  const rotulo = excluido ? 'Excluído' : status

  return (
    <span className={`${styles.badge} ${styles[variante]}`} data-variant={variante}>
      {rotulo}
    </span>
  )
}
