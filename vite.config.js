import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    // Optional: Add proxy if CORS issues occur with Convex backend
    proxy: {
      // Only proxy /convex/api requests to the backend
      // /convex/_generated files should be served from local filesystem via Vite's module resolution
      '/convex/api': {
        target: 'http://localhost:3210',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxy for real-time updates
        rewrite: (path) => path.replace(/^\/convex\/api/, '/api'),
      }
    }
  }
})
