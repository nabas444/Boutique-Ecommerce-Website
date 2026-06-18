import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, "..");

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, rootDir, "VITE_");
  const env = { ...rootEnv, ...process.env };
  const backendUrl = env.VITE_API_URL || "http://localhost:4000";

  return {
    plugins: [react()],
    envDir: rootDir,
    server: {
      host: true,
      port: 5174,
      strictPort: true,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
        "/socket.io": {
          target: backendUrl,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
