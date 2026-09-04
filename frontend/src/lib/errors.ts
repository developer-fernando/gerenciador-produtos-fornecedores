import { isAxiosError } from 'axios'

/**
 * Erro normalizado da API, no formato que a UI consome.
 * - `status`: HTTP status (0 quando não houve resposta — falha de rede).
 * - `message`: texto em português, pronto para exibir (sem detalhes internos).
 * - `code`: identificador estável de regra de negócio (409/422), quando houver.
 * - `fieldErrors`: erros por campo (do 422 de validação), já achatados para 1 msg/campo.
 */
export interface ApiError {
  status: number
  message: string
  code?: string
  fieldErrors?: Record<string, string>
}

export const MENSAGEM_GENERICA = 'Ocorreu um erro inesperado. Tente novamente.'
export const MENSAGEM_REDE =
  'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'

function mensagemPadraoPorStatus(status: number): string {
  if (status === 404) return 'Registro não encontrado.'
  return MENSAGEM_GENERICA
}

function extrairFieldErrors(errors: unknown): Record<string, string> | undefined {
  if (typeof errors !== 'object' || errors === null) return undefined
  const resultado: Record<string, string> = {}
  for (const [campo, mensagens] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(mensagens) && typeof mensagens[0] === 'string') {
      resultado[campo] = mensagens[0]
    } else if (typeof mensagens === 'string') {
      resultado[campo] = mensagens
    }
  }
  return Object.keys(resultado).length > 0 ? resultado : undefined
}

/**
 * Converte qualquer erro (axios, rede, inesperado) num `ApiError` único.
 * Trata os formatos padronizados do back-end: 422 (validação → `fieldErrors`),
 * 409/422 de regra (→ `code`), 404/500 (→ `message` genérico). Nunca expõe
 * `trace`/`exception`/`file` — usa apenas `message`/`code`/`errors` do corpo.
 */
export function normalizarErro(erro: unknown): ApiError {
  if (isAxiosError(erro)) {
    if (erro.response) {
      const status = erro.response.status
      const data = (erro.response.data ?? {}) as {
        message?: unknown
        code?: unknown
        errors?: unknown
      }
      const message =
        typeof data.message === 'string' && data.message.trim() !== ''
          ? data.message
          : mensagemPadraoPorStatus(status)
      const code = typeof data.code === 'string' ? data.code : undefined
      const fieldErrors = extrairFieldErrors(data.errors)
      return { status, message, code, fieldErrors }
    }
    // Requisição feita, sem resposta (timeout, servidor fora, CORS): falha de rede.
    return { status: 0, message: MENSAGEM_REDE }
  }
  return { status: 0, message: MENSAGEM_GENERICA }
}

/** Type guard para o `ApiError` normalizado (útil no `onError` do React Query). */
export function ehApiError(valor: unknown): valor is ApiError {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'status' in valor &&
    'message' in valor &&
    typeof (valor as ApiError).message === 'string'
  )
}
