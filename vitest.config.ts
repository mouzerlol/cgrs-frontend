import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // `server-only` throws on import outside a server component, which is the
      // point of it — it is what stops the blog fetcher shipping to the browser.
      // Vitest runs in jsdom, so it resolves the client build and every test
      // touching `src/lib/blog/` would fail on the guard rather than on its own
      // assertion. The no-op build is what Next itself substitutes on the server.
      'server-only': path.resolve(__dirname, './node_modules/server-only/empty.js'),
    },
  },
});
