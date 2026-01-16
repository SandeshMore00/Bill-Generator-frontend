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
    // Note: Proxy is now OPTIONAL since we use VITE_API_BASE_URL
    // Uncomment if you want to test with relative paths in development
    // proxy: {
    //   '/bill': {
    //     target: 'https://thepartykart.com',
    //     changeOrigin: true,
    //     secure: false
    //   }
    // }
  }
});

