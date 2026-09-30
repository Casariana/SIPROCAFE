import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SIPROCAFE Navigation - Frontend
// Servidor en puerto 5173, con proxy de /api hacia el backend (Express) en el puerto 3001.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
