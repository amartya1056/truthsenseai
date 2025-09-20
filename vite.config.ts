import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/mediastack': {
        target: 'http://api.mediastack.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mediastack/, '')
      },
      '/api/serpapi': {
        target: 'https://serpapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/serpapi/, '')
      },
      '/api/youtube': {
        target: 'https://www.googleapis.com/youtube',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/youtube/, '')
      }
    }
  }
})
