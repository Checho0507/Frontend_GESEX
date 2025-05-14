import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '3000')
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '3000'),
    allowedHosts: ['healthcheck.railway.app']
  },
  build: {
    outDir: 'dist',
    // Retraso de cierre del servidor para compatibilidad con Railway
    chunkSizeWarningLimit: 1600
  }
})
