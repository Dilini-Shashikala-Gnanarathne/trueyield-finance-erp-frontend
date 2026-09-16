import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // Enables @/api/..., @/components/..., etc.
      '@': resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      // All /api/payroll/* requests → API Gateway (:8080)
      '/api/payroll': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // All /api/finance/* requests → Finance Service direct (:8082)
      '/api/finance': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      // All /api/auth/* requests → Auth Service (:8085)
      '/api/auth': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, ''),
      },
    },
  },
});
