import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// `--mode demo` produces a self-contained build for sharing as a hosted demo:
// in-memory routing (no URL dependence) and fonts/small assets inlined.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: mode === 'demo' ? 'dist-demo' : 'dist',
    target: 'es2020',
    assetsInlineLimit: mode === 'demo' ? 160_000 : 4096,
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
