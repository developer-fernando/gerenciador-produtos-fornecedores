import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Pagination } from '../../../shared/components/Pagination'
import { useProdutos } from '../hooks'
import type { ProdutoFiltros } from '../types'
import { ProdutosFiltros } from './ProdutosFiltros'
import styles from './ProdutosPage.module.css'
import { ProdutosTabela } from './ProdutosTabela'

/**
 * Tela de Produtos: filtros + listagem paginada com estados de
 * carregamento/vazio/erro. O formulário (criar/editar) entra na 05-T4 e as
 * ações por registro na 05-T5.
 */
export function ProdutosPage() {
  const [filtros, setFiltros] = useState<ProdutoFiltros>({ page: 1 })
  const { data, isLoading, isError, refetch } = useProdutos(filtros)

  const atualizarFiltro = (parcial: Partial<ProdutoFiltros>) =>
    setFiltros((f) => ({ ...f, ...parcial, page: 1 }))
  const irParaPagina = (page: number) => setFiltros((f) => ({ ...f, page }))

  const vazio = !data || data.data.length === 0

  return (
    <section>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Produtos</h1>
      </header>

      <ProdutosFiltros filtros={filtros} onChange={atualizarFiltro} />

      {isLoading ? (
        <div className={styles.estado} role="status">
          Carregando produtos…
        </div>
      ) : isError ? (
        <div className={`${styles.estado} ${styles.estadoErro}`} role="alert">
          Não foi possível carregar os produtos.
          <div className={styles.acao}>
            <Button variante="secundario" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : vazio ? (
        <div className={styles.estado}>Nenhum produto encontrado.</div>
      ) : (
        <>
          <ProdutosTabela produtos={data.data} />
          <Pagination meta={data.meta} onPageChange={irParaPagina} />
        </>
      )}
    </section>
  )
}
