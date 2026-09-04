import type { ReactNode } from 'react'
import { Button } from './Button'
import styles from './ConfirmDialog.module.css'
import { Modal } from './Modal'

/**
 * Diálogo de confirmação sobre o Modal. Usado nas ações de ciclo de vida.
 * `destrutivo` pinta o botão de confirmação como perigo; `aviso` destaca um
 * alerta (ex.: irreversibilidade da exclusão definitiva, impacto ao inativar).
 */
export function ConfirmDialog({
  open,
  title,
  message,
  aviso,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destrutivo = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean
  title: string
  message: ReactNode
  aviso?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destrutivo?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variante="secundario" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variante={destrutivo ? 'perigo' : 'primario'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processando…' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className={styles.mensagem}>{message}</div>
      {children}
      {aviso && <div className={styles.aviso}>{aviso}</div>}
    </Modal>
  )
}
