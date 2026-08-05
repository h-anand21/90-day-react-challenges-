import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

// Plugin to mock cloudflare:workers so browser import-analysis resolves smoothly
const cloudflareWorkersPlugin = () => ({
  name: "resolve-cloudflare-workers",
  resolveId(id: string) {
    if (id === "cloudflare:workers") {
      return "\0cloudflare:workers";
    }
  },
  load(id: string) {
    if (id === "\0cloudflare:workers") {
      return "export const env = {}; export default { env };";
    }
  },
});

const polyfillPath = path.resolve(__dirname, "./src/lib/async-hooks-polyfill.ts");

export default defineConfig({
  plugins: [
    cloudflareWorkersPlugin(),
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "node:async_hooks": polyfillPath,
      "async_hooks": polyfillPath,
    },
  },
  optimizeDeps: {
    include: ["@tanstack/react-start"],
  },
  server: {
    port: 5174,
    strictPort: false,
  },
});
