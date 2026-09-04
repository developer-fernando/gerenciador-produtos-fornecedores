import type { PageMeta } from '../types'
import { Button } from './Button'
import styles from './Pagination.module.css'

/**
 * Paginação server-side (10/pág — docs/04). Recebe o `meta` do envelope e
 * emite a página desejada; desabilita nos limites.
 */
export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PageMeta
  onPageChange: (page: number) => void
}) {
  const { current_page, last_page, total, from, to } = meta
  const temAnterior = current_page > 1
  const temProxima = current_page < last_page

  return (
    <nav className={styles.paginacao} aria-label="Paginação">
      <span className={styles.info}>
        {total > 0
          ? `Mostrando ${from}–${to} de ${total}`
          : 'Nenhum registro'}
      </span>
      <div className={styles.controles}>
        <Button
          variante="secundario"
          pequeno
          onClick={() => onPageChange(current_page - 1)}
          disabled={!temAnterior}
          aria-label="Página anterior"
        >
          ← Anterior
        </Button>
        <span className={styles.pagina} aria-current="page">
          Página {current_page} de {last_page || 1}
        </span>
        <Button
          variante="secundario"
          pequeno
          onClick={() => onPageChange(current_page + 1)}
          disabled={!temProxima}
          aria-label="Próxima página"
        >
          Próxima →
        </Button>
      </div>
    </nav>
  )
}
