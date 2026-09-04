import type { ReactNode } from 'react'
import { idErro } from './fieldClasses'
import styles from './FormField.module.css'

/**
 * Envólucro de campo de formulário: rótulo + controle (children) + erro.
 * O erro é anunciado por leitores de tela (role="alert"). O caller aplica
 * `campoClasses(!!error)` e `aria-describedby={idErro(id)}` no seu controle.
 */
export function FormField({
  id,
  label,
  required = false,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className={styles.field}>
      <label
        htmlFor={id}
        className={`${styles.label} ${required ? styles.obrigatorio : ''}`}
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={idErro(id)} className={styles.erro} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
