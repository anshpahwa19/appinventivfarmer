import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// `--mode demo` produces a self-contained build for sharing as a hosted demo:
// in-memory routing (no URL dependence) and fonts/small assets inlined.
// `--mode demo2` is the same build, opening on Direction 02 (/d2).
// STANDALONE=1 bundles demo2 into one script with every asset inlined, for
// scripts/make-standalone.mjs to fold into a single downloadable HTML file.
const STANDALONE = process.env.STANDALONE === '1';
// VITE_MOBILE=1 (with STANDALONE=1) makes the phone preview build: real
// safe-area insets, hash routing so the phone's back button and swipe work,
// and app-like head tags added by make-standalone.mjs. See npm run build:mobile.
const MOBILE = process.env.VITE_MOBILE === '1';

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
    outDir: STANDALONE ? (MOBILE ? 'dist-mobile/build' : 'dist-standalone') : mode === 'demo' ? 'dist-demo' : mode === 'demo2' ? 'dist-demo2' : 'dist',
    target: 'es2020',
    assetsInlineLimit: STANDALONE ? 100_000_000 : mode.startsWith('demo') ? 160_000 : 4096,
    cssCodeSplit: !STANDALONE,
    rollupOptions: STANDALONE ? { output: { inlineDynamicImports: true } } : undefined,
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
