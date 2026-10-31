import { defineConfig } from 'vite';

// Build statica (cartella dist) per la pubblicazione della tappa 5. I dati arrivano da docs/03-cards-content/ in fase di build.
export default defineConfig({
  base: './',
  server: { fs: { allow: ['../..'] }, port: 5183, strictPort: true },
  preview: { port: 5184, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2022', chunkSizeWarningLimit: 1500 },
});
