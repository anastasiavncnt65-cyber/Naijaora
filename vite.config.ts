import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Custom domain (naijaora.com) serves from /. Project pages URL needs /Naijaora/.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
})
