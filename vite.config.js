import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  server: {
    proxy: {
      '/bill': {
        // target: 'http://localhost:9000',
        // target: 'https://www.thepartykart.com',
        target: 'http://13.83.89.57:9000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

