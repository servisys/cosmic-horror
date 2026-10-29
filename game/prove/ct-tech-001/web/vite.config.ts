import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { outDir: 'dist', sourcemap: false },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
