import { defineConfig } from 'npm:vite@5.1.4';
import { svelte } from 'npm:@sveltejs/vite-plugin-svelte@3.0.0';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/gun': {
        target: 'ws://localhost:8765',
        ws: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['gun'],
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    outDir: '../public',
    emptyOutDir: true,
  },
  // Deno-specific configuration
  esbuild: {
    platform: 'browser',
    target: 'esnext',
  },
});
