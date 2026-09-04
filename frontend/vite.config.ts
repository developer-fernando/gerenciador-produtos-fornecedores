import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expõe na rede (necessário dentro do container)
    port: Number(process.env.PORT) || 5173,
    watch: {
      // hot reload confiável em bind mounts do Windows/Docker
      usePolling: true,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Testes com jsdom + MSW + user-event podem estourar o timeout padrão (5s)
    // sob carga da suíte completa no Windows; folga evita flakiness de timing.
    testTimeout: 15000,
    hookTimeout: 15000,
  },
})
