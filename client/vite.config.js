import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
  base: './',
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  }
});
