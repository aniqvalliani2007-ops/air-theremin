import { defineConfig } from 'vite'

// Fixed MediaPipe bundling issue for Vercel deployment
export default defineConfig({
  server: {
    host: true,       // Allow network access
    port: 3000,
    open: true        // Auto-open browser
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      external: ['@mediapipe/hands'],
      output: {
        manualChunks: undefined
      }
    }
  }
})