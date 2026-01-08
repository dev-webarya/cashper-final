import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 4208,
    strictPort: false,  // Allow port fallback if 4208 is busy
    host: 'localhost',  // Only localhost, no network address
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts', 'lucide-react', 'axios', 'framer-motion'],
    exclude: ['@react-oauth/google'],
  },
  ssr: {
    noExternal: ['recharts'],
  },
})