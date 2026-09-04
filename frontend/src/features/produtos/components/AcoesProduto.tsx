import { useState } from 'react'
import { ehApiError } from '../../../lib/errors'
import { Button } from '../../../shared/components/Button'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { useToast } from '../../../shared/components/toastContext'
import { useProdutoMutations } from '../hooks'
import type { Produto } from '../types'
import styles from './AcoesProduto.module.css'

type Dialogo = null | 'inativar' | 'excluir' | 'forcar'

/**
 * Botões de ação por produto, exibidos **somente** conforme `acoes_permitidas`
 * (nunca oferecer ação que a regra recusaria — docs/05). Ações com impacto ou
 * irreversíveis pedem confirmação; 409/422 de regra viram feedback.
 */
export function AcoesProduto({
  produto,
  onEditar,
}: {
  produto: Produto
  onEditar: (produto: Produto) => void
}) {
  const { inativar, reativar, excluir, restaurar, forcar } = useProdutoMutations()
  const toast = useToast()
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const acoes = produto.acoes_permitidas

  const feedback = (sucesso: string) => ({
    onSuccess: () => {
      toast.sucesso(sucesso)
      setDialogo(null)
    },
    onError: (erro: unknown) => {
      toast.erro(ehApiError(erro) ? erro.message : 'Não foi possível concluir a ação.')
      setDialogo(null)
    },
  })

  const processando =
    inativar.isPending ||
    reativar.isPending ||
    excluir.isPending ||
    restaurar.isPending ||
    forcar.isPending

  return (
    <div className={styles.acoes}>
      {acoes.editar && (
        <Button variante="fantasma" pequeno onClick={() => onEditar(produto)}>
          Editar
        </Button>
      )}
      {acoes.inativar && (
        <Button variante="fantasma" pequeno onClick={() => setDialogo('inativar')}>
          Inativar
        </Button>
      )}
      {acoes.reativar && (
        <Button
          variante="fantasma"
          pequeno
          onClick={() => reativar.mutate(produto.id, feedback('Produto reativado.'))}
        >
          Reativar
        </Button>
      )}
      {acoes.excluir && (
        <Button variante="perigoFantasma" pequeno onClick={() => setDialogo('excluir')}>
          Excluir
        </Button>
      )}
      {acoes.restaurar && (
        <Button
          variante="fantasma"
          pequeno
          onClick={() => restaurar.mutate(produto.id, feedback('Produto restaurado.'))}
        >
          Restaurar
        </Button>
      )}
      {acoes.excluir_definitivamente && (
        <Button variante="perigoFantasma" pequeno onClick={() => setDialogo('forcar')}>
          Excluir definitivamente
        </Button>
      )}

      <ConfirmDialog
        open={dialogo === 'inativar'}
        title="Inativar produto"
        message={`Inativar “${produto.nome}”?`}
        confirmLabel="Inativar"
        loading={inativar.isPending}
        onConfirm={() => inativar.mutate(produto.id, feedback('Produto inativado.'))}
        onCancel={() => setDialogo(null)}
      />

      <ConfirmDialog
        open={dialogo === 'excluir'}
        title="Excluir produto"
        message={`Excluir “${produto.nome}”? O produto irá para a lixeira e pode ser restaurado depois.`}
        confirmLabel="Excluir"
        destrutivo
        loading={excluir.isPending}
        onConfirm={() => excluir.mutate(produto.id, feedback('Produto excluído.'))}
        onCancel={() => setDialogo(null)}
      />

      <ConfirmDialog
        open={dialogo === 'forcar'}
        title="Excluir definitivamente"
        message={`Excluir definitivamente “${produto.nome}”?`}
        aviso="Esta ação é irreversível: os dados não poderão ser recuperados."
        confirmLabel="Excluir definitivamente"
        destrutivo
        loading={forcar.isPending}
        onConfirm={() => forcar.mutate(produto.id, feedback('Produto excluído definitivamente.'))}
        onCancel={() => setDialogo(null)}
      />

      {processando && <span className="sr-only">Processando…</span>}
    </div>
  )
}
