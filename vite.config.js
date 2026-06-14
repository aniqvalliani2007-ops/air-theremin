import { defineConfig } from 'vite'

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
      output: {
        manualChunks: {
          'mediapipe': ['@mediapipe/hands']
        }
      }
    }
  }
})