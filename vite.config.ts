import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the app works from any sub-path, e.g. https://<user>.github.io/lean-bulk/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5188 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'safari16',
    assetsInlineLimit: 0,
  },
});
