import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// `--mode demo` produces a self-contained build for sharing as a hosted demo:
// in-memory routing (no URL dependence) and fonts/small assets inlined.
// `--mode demo2` is the same build, opening on Direction 02 (/d2).
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'direction-title',
      transformIndexHtml: (html) => (mode === 'demo2' ? html.replace('<title>Kisani Urjaa</title>', '<title>Kisani Urjaa Field Journal</title>') : html),
    },
  ],
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: mode === 'demo' ? 'dist-demo' : mode === 'demo2' ? 'dist-demo2' : 'dist',
    target: 'es2020',
    assetsInlineLimit: mode.startsWith('demo') ? 160_000 : 4096,
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
