import { createContext, useContext } from 'react'

export type ToastTipo = 'sucesso' | 'erro'

export interface ToastAPI {
  sucesso: (mensagem: string) => void
  erro: (mensagem: string) => void
}

export const ToastContext = createContext<ToastAPI | null>(null)

/** Acessa o feedback global. Deve estar dentro de <ToastProvider>. */
export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast precisa estar dentro de <ToastProvider>.')
  }
  return ctx
}
