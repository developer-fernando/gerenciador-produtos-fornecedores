import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Pagination } from '../../../shared/components/Pagination'
import { useEmpresas } from '../hooks'
import type { EmpresaFiltros } from '../types'
import { EmpresasFiltros } from './EmpresasFiltros'
import styles from './EmpresasPage.module.css'
import { EmpresasTabela } from './EmpresasTabela'

/**
 * Tela de Empresas: filtros + listagem paginada com estados de
 * carregamento/vazio/erro. As ações por registro entram na 04-T8 e o
 * formulário de criar/editar na 04-T7.
 */
export function EmpresasPage() {
  const [filtros, setFiltros] = useState<EmpresaFiltros>({ page: 1 })
  const { data, isLoading, isError, refetch } = useEmpresas(filtros)

  // Ao filtrar, volta para a primeira página; a paginação só troca `page`.
  const atualizarFiltro = (parcial: Partial<EmpresaFiltros>) =>
    setFiltros((f) => ({ ...f, ...parcial, page: 1 }))
  const irParaPagina = (page: number) => setFiltros((f) => ({ ...f, page }))

  const vazio = !data || data.data.length === 0

  return (
    <section>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Empresas</h1>
      </header>

      <EmpresasFiltros filtros={filtros} onChange={atualizarFiltro} />

      {isLoading ? (
        <div className={styles.estado} role="status">
          Carregando empresas…
        </div>
      ) : isError ? (
        <div className={`${styles.estado} ${styles.estadoErro}`} role="alert">
          Não foi possível carregar as empresas.
          <div className={styles.acao}>
            <Button variante="secundario" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : vazio ? (
        <div className={styles.estado}>Nenhuma empresa encontrada.</div>
      ) : (
        <>
          <EmpresasTabela empresas={data.data} />
          <Pagination meta={data.meta} onPageChange={irParaPagina} />
        </>
      )}
    </section>
  )
}
