import type { ReactNode } from 'react'
import styles from './Table.module.css'

/**
 * Envólucro de tabela: rola horizontalmente em telas estreitas (responsivo).
 * O conteúdo (thead/tbody) é fornecido por quem usa.
 */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrap}>
      <table>{children}</table>
    </div>
  )
}
