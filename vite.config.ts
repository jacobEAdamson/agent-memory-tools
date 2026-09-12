import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  ssr: {
    target: 'node',
  },
  build: {
    ssr: resolve(import.meta.dirname, 'src/index.ts'),
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      output: {
        format: 'cjs',
        entryFileNames: 'index.cjs',
      },
    },
  },
});