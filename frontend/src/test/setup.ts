// Setup global dos testes (Vitest + Testing Library).
// Adiciona os matchers de DOM (toBeInTheDocument, etc.) e limpa o DOM entre os testes.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
