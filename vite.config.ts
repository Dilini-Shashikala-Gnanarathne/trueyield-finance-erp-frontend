import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/payroll": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/api/finance": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
      },
      "/api/auth/v1/auth": {
        target: "http://localhost:8085",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, "/api"),
      },
      "/api/auth/v1/profile": {
        target: "http://localhost:8085",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, "/api"),
      },
      "/api/marketplace": {
        target: "http://localhost:8086",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/marketplace/, ""),
      },
    },
  },
});
