import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub project pages: /Naijaora/
// Custom domain naijaora.com: set VITE_BASE_PATH=/ in the workflow
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/Naijaora/',
  plugins: [react()],
})
