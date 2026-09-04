import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { ehApiError } from '../../../lib/errors'
import { useToast } from '../../../shared/components/toastContext'
import { useEmpresaMutations } from '../hooks'
import type { Empresa } from '../types'
import styles from './AcoesEmpresa.module.css'

type Dialogo = null | 'inativar' | 'excluir' | 'forcar'

/**
 * Botões de ação por empresa, exibidos **somente** conforme `acoes_permitidas`
 * (nunca oferecer ação que a regra recusaria — docs/05). Ações com impacto ou
 * irreversíveis pedem confirmação; erros de regra (409) viram feedback.
 */
export function AcoesEmpresa({
  empresa,
  onEditar,
}: {
  empresa: Empresa
  onEditar: (empresa: Empresa) => void
}) {
  const { inativar, reativar, excluir, restaurar, forcar } = useEmpresaMutations()
  const toast = useToast()
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const acoes = empresa.acoes_permitidas

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
        <Button variante="fantasma" pequeno onClick={() => onEditar(empresa)}>
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
          onClick={() => reativar.mutate(empresa.id, feedback('Empresa reativada.'))}
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
          onClick={() => restaurar.mutate(empresa.id, feedback('Empresa restaurada.'))}
        >
          Restaurar
        </Button>
      )}
      {acoes.excluir_definitivamente && (
        <Button variante="perigoFantasma" pequeno onClick={() => setDialogo('forcar')}>
          Excluir definitivamente
        </Button>
      )}

      {/* Inativar: informa o impacto nos produtos vinculados (docs/05 §4). */}
      <ConfirmDialog
        open={dialogo === 'inativar'}
        title="Inativar empresa"
        message={`Inativar “${empresa.nome}”?`}
        aviso={
          empresa.produtos_count > 0
            ? `Os ${empresa.produtos_count} produto(s) vinculados também serão inativados.`
            : undefined
        }
        confirmLabel="Inativar"
        loading={inativar.isPending}
        onConfirm={() => inativar.mutate(empresa.id, feedback('Empresa inativada.'))}
        onCancel={() => setDialogo(null)}
      />

      {/* Exclusão lógica: reversível (pode ser restaurada). */}
      <ConfirmDialog
        open={dialogo === 'excluir'}
        title="Excluir empresa"
        message={`Excluir “${empresa.nome}”? A empresa e seus produtos irão para a lixeira e podem ser restaurados depois.`}
        confirmLabel="Excluir"
        destrutivo
        loading={excluir.isPending}
        onConfirm={() => excluir.mutate(empresa.id, feedback('Empresa excluída.'))}
        onCancel={() => setDialogo(null)}
      />

      {/* Exclusão definitiva: irreversível. */}
      <ConfirmDialog
        open={dialogo === 'forcar'}
        title="Excluir definitivamente"
        message={`Excluir definitivamente “${empresa.nome}”?`}
        aviso="Esta ação é irreversível: os dados não poderão ser recuperados."
        confirmLabel="Excluir definitivamente"
        destrutivo
        loading={forcar.isPending}
        onConfirm={() => forcar.mutate(empresa.id, feedback('Empresa excluída definitivamente.'))}
        onCancel={() => setDialogo(null)}
      />

      {processando && <span className="sr-only">Processando…</span>}
    </div>
  )
}
