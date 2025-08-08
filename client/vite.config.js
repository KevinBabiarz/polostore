import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
  // Ajoute ici d'autres options si besoin (alias, etc.)
});
