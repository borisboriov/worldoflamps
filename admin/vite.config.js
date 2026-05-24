import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api/auth': { target: 'http://localhost:8003', changeOrigin: true },
      '/api/orders': { target: 'http://localhost:8002', changeOrigin: true },
      '/api/products': { target: 'http://localhost:8001', changeOrigin: true },
    },
  },
})
