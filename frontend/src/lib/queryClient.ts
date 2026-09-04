import { QueryClient } from '@tanstack/react-query'

// Cliente único do TanStack Query. Defaults conservadores:
// - retry moderado (erros de validação/regra não devem repetir infinitamente);
// - staleTime curto para manter as listagens frescas após ações.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
