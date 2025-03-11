import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: '../public',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/gun': {
        target: 'ws://localhost:8765',
        ws: true
      }
    }
  }
});
