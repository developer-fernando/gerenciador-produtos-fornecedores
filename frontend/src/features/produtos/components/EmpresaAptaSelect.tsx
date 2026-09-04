import { useMemo } from 'react'
import { campoClasses, idErro } from '../../../shared/components/fieldClasses'
import { FormField } from '../../../shared/components/FormField'
import { useEmpresasAptas } from '../hooks'
import type { EmpresaResumo } from '../types'
import styles from './EmpresaAptaSelect.module.css'

/**
 * Seletor de **empresa apta** (ativa e não excluída) para o formulário de produto.
 * As opções vêm de `useEmpresasAptas()` (todas as páginas). Na edição, injeta a
 * `empresaVinculada` caso não venha na lista, garantindo que apareça selecionada.
 * Sem nenhuma empresa apta, orienta o usuário (o submit fica barrado pela
 * validação de `empresa_id`).
 */
export function EmpresaAptaSelect({
  value,
  onChange,
  empresaVinculada,
  error,
}: {
  value: number | ''
  onChange: (empresaId: number | '') => void
  empresaVinculada?: EmpresaResumo
  error?: string
}) {
  const { data, isLoading, isError } = useEmpresasAptas()

  const opcoes = useMemo(() => {
    const lista = data ?? []
    if (empresaVinculada && !lista.some((e) => e.id === empresaVinculada.id)) {
      return [empresaVinculada, ...lista]
    }
    return lista
  }, [data, empresaVinculada])

  return (
    <FormField id="produto-empresa" label="Empresa" required error={error}>
      {isLoading ? (
        <select className={campoClasses(false)} disabled aria-label="Empresa (carregando)">
          <option>Carregando empresas…</option>
        </select>
      ) : isError ? (
        <p className={styles.aviso} role="alert">
          Não foi possível carregar as empresas. Tente novamente.
        </p>
      ) : (
        <>
          <select
            id="produto-empresa"
            className={campoClasses(Boolean(error))}
            value={value === '' ? '' : String(value)}
            onChange={(e) =>
              onChange(e.target.value === '' ? '' : Number(e.target.value))
            }
            aria-invalid={Boolean(error)}
            aria-describedby={error ? idErro('produto-empresa') : undefined}
          >
            <option value="">Selecione uma empresa…</option>
            {opcoes.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </option>
            ))}
          </select>
          {opcoes.length === 0 && (
            <p className={styles.aviso}>
              Nenhuma empresa apta. Cadastre ou ative uma empresa antes de criar um produto.
            </p>
          )}
        </>
      )}
    </FormField>
  )
}
