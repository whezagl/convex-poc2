import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Optional: Add proxy if CORS issues occur with Convex backend
    proxy: {
      '/convex': {
        target: 'http://localhost:3210',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxy for real-time updates
      }
    }
  }
})
