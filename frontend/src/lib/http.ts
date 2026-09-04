import axios from 'axios'
import { normalizarErro } from './errors'

/**
 * Cliente HTTP central. `baseURL` vem de VITE_API_URL (ex.: http://localhost:8000/api).
 * Envia sempre JSON. O interceptor de resposta converte qualquer erro num
 * `ApiError` normalizado, para a UI ter um formato único (docs/10, docs/15).
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

http.interceptors.response.use(
  (resposta) => resposta,
  (erro) => Promise.reject(normalizarErro(erro)),
)
