import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import styles from './Toast.module.css'
import { ToastContext } from './toastContext'
import type { ToastTipo } from './toastContext'

interface ToastItem {
  id: number
  tipo: ToastTipo
  mensagem: string
}

const DURACAO_MS = 4000

/**
 * Provê o feedback global (toasts de sucesso/erro) e renderiza a pilha numa
 * região aria-live para leitores de tela. Auto-descarta após alguns segundos.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remover = useCallback((id: number) => {
    setToasts((atuais) => atuais.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (tipo: ToastTipo, mensagem: string) => {
      const id = Date.now() + Math.random()
      setToasts((atuais) => [...atuais, { id, tipo, mensagem }])
      window.setTimeout(() => remover(id), DURACAO_MS)
    },
    [remover],
  )

  const api = useMemo(
    () => ({
      sucesso: (mensagem: string) => push('sucesso', mensagem),
      erro: (mensagem: string) => push('erro', mensagem),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${t.tipo === 'sucesso' ? styles.sucesso : styles.erro}`}
            role={t.tipo === 'erro' ? 'alert' : 'status'}
          >
            {t.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
