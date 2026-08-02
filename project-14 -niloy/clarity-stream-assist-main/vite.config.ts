import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

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

// Plugin to polyfill node:async_hooks for browser environment
const nodeAsyncHooksMockPlugin = () => ({
  name: "mock-node-async-hooks",
  resolveId(id: string) {
    if (id === "node:async_hooks" || id === "async_hooks") {
      return "\0node:async_hooks";
    }
  },
  load(id: string) {
    if (id === "\0node:async_hooks") {
      return `
        export class AsyncLocalStorage {
          disable() {}
          getStore() { return undefined; }
          run(store, callback, ...args) { return callback ? callback(...args) : undefined; }
          exit(callback, ...args) { return callback ? callback(...args) : undefined; }
          enterWith() {}
        }
        export class AsyncResource {
          runInAsyncScope(fn, ...args) { return fn(...args); }
          emitDestroy() {}
          asyncId() { return 0; }
          triggerAsyncId() { return 0; }
        }
        export default { AsyncLocalStorage, AsyncResource };
      `;
    }
  },
});

export default defineConfig({
  plugins: [
    cloudflareWorkersPlugin(),
    nodeAsyncHooksMockPlugin(),
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 5174,
    strictPort: false,
  },
});
