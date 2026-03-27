import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/SAPNA/',   // ← GitHub repo name (must match exactly)
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
  }
})
