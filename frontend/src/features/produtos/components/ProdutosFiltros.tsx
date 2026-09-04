import type { Status } from '../../../shared/types'
import type { ProdutoFiltros } from '../types'
import styles from './ProdutosFiltros.module.css'

/**
 * Filtros da listagem de produtos: nome (parcial), status e toggle de excluídos.
 * Mesmo padrão da listagem de Empresas (docs/04). Sem filtro por empresa (fora de escopo).
 */
export function ProdutosFiltros({
  filtros,
  onChange,
}: {
  filtros: ProdutoFiltros
  onChange: (parcial: Partial<ProdutoFiltros>) => void
}) {
  return (
    <div className={styles.filtros}>
      <div className={styles.campo}>
        <label className={styles.rotulo} htmlFor="filtro-produto-nome">
          Nome
        </label>
        <input
          id="filtro-produto-nome"
          type="search"
          className={styles.controle}
          placeholder="Buscar por nome"
          value={filtros.nome ?? ''}
          onChange={(e) => onChange({ nome: e.target.value })}
        />
      </div>

      <div className={styles.campo}>
        <label className={styles.rotulo} htmlFor="filtro-produto-status">
          Status
        </label>
        <select
          id="filtro-produto-status"
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
