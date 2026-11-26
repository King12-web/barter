import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forwards any /api/* request from the Vite dev server to
      // your local Express server (local-dev.js on port 3001),
      // so frontend code calling fetch("/api/...") works the same
      // way in development as it does in production, where Vercel
      // routes /api/* to the same Express app directly.
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
})