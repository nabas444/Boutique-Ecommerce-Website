import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        // Use VITE_API_URL when provided (docker/dev), otherwise default to localhost
        target: process.env.VITE_API_URL || "http://localhost:4000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: process.env.VITE_API_URL || "http://localhost:4000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
