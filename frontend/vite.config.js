import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/orders': { target: 'http://localhost:8002', changeOrigin: true },
      '/api/products': { target: 'http://localhost:8001', changeOrigin: true },
    },
  },
})
