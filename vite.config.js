import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages sub-path: https://abhishub-12.github.io/RAG-ARCH/
export default defineConfig({
  base: '/RAG-ARCH/',
  plugins: [react()],
})
