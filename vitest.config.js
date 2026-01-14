import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Vitest Configuration
 *
 * This configures Vitest for testing the Convex POC application.
 * - Uses React plugin for JSX/TSX support
 * - jsdom environment for DOM testing
 * - Setup file for global test configuration
 *
 * References:
 * - Vitest Docs: https://vitest.dev/config/
 * - Testing Library: https://testing-library.com/react
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'convex/_generated/',
        '**/*.config.{js,ts}',
        '**/dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
