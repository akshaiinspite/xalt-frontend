import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

const compression = viteCompression as any;

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'brotliCompress' }),
    compression({ algorithm: 'gzip' })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('react-dom') || id.includes('react/') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('lenis')) return 'vendor-lenis';
            return 'vendor-utils';
          }
        }
      }
    }
  }
});
