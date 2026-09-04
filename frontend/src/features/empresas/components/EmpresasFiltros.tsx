import type { Status } from '../../../shared/types'
import type { EmpresaFiltros } from '../types'
import styles from '../../../shared/components/FiltrosBar.module.css'

/**
 * Filtros da listagem: nome (parcial), status (Ativo/Inativo) e um toggle para
 * ver apenas os excluídos (acesso a excluídos só por filtro explícito — docs/04).
 * Emite mudanças parciais; o pai reseta a página ao filtrar.
 */
export function EmpresasFiltros({
  filtros,
  onChange,
}: {
  filtros: EmpresaFiltros
  onChange: (parcial: Partial<EmpresaFiltros>) => void
}) {
  return (
    <div className={styles.filtros}>
      <div className={`${styles.campo} ${styles.campoBusca}`}>
        <label className={styles.rotulo} htmlFor="filtro-nome">
          Nome
        </label>
        <input
          id="filtro-nome"
          type="search"
          className={styles.controle}
          placeholder="Buscar por nome"
          value={filtros.nome ?? ''}
          onChange={(e) => onChange({ nome: e.target.value })}
        />
      </div>

      <div className={`${styles.campo} ${styles.campoCurto}`}>
        <label className={styles.rotulo} htmlFor="filtro-status">
          Status
        </label>
        <select
          id="filtro-status"
          className={styles.controle}
          value={filtros.status ?? ''}
          onChange={(e) => onChange({ status: e.target.value as Status | '' })}
        >
          <option value="">Todos</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
      </div>

      <label className={styles.check}>
        <input
          type="checkbox"
          checked={filtros.excluidos ?? false}
          onChange={(e) => onChange({ excluidos: e.target.checked })}
        />
        Mostrar apenas excluídos
      </label>
    </div>
  )
}
