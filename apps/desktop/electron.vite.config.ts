import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/postcss";

const backend = process.env.DESKTOP_BACKEND_URL ?? "http://localhost:3001";

export default defineConfig({
  main: { plugins: [externalizeDepsPlugin()] },
  preload: { plugins: [externalizeDepsPlugin()] },
  renderer: {
    resolve: {
      alias: [
        { find: "@/i18n/navigation", replacement: resolve("src/renderer/src/navigation.tsx") },
        { find: "@", replacement: resolve("src/renderer/frontend/src") },
      ],
      dedupe: ["react", "react-dom", "next-intl", "@tanstack/react-query"],
    },
    define: {
      "process.env.NEXT_PUBLIC_API_BASE_URL": JSON.stringify("/api/v1"),
      "process.env.NEXT_PUBLIC_AUTH_BASE_URL": JSON.stringify("/api/auth"),
      "process.env.NEXT_PUBLIC_BACKEND_URL": JSON.stringify(backend),
    },
    css: { postcss: { plugins: [tailwind()] } },
    server: {
      host: "localhost",
      port: 47831,
      strictPort: true,
      proxy: {
        "/api": {
          target: backend,
          changeOrigin: true,
          cookieDomainRewrite: "",
          configure(proxy) {
            proxy.on("proxyReq", (request) => request.setHeader("origin", new URL(backend).origin));
          },
        },
      },
    },
    plugins: [react()],
  },
});
