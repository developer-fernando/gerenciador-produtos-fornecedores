import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expõe na rede (necessário dentro do container)
    port: 5173,
    watch: {
      // hot reload confiável em bind mounts do Windows/Docker
      usePolling: true,
    },
  },
})
