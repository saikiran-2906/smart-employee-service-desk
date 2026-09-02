import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config: enables React fast-refresh and proxies /api calls
// to the backend server during development, so the frontend
// can call "/api/tickets" instead of "http://localhost:5000/api/tickets".
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
