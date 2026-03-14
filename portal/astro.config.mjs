import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://lahabanera.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    server: {
      port: 3001,
      host: true
    }
  }
});
