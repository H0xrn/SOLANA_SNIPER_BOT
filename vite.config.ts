import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      // Provide a mock implementation for react-hot-toast
      'react-hot-toast': resolve(__dirname, './src/lib/toast-shim.ts'),
      '@': resolve(__dirname, './src'),
      
      // Add polyfills for Node.js core modules
      stream: 'stream-browserify',
      buffer: 'buffer',
      crypto: 'crypto-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      zlib: 'browserify-zlib',
      url: 'url',
    },
  },
  build: {
    // Enable emitting files when typescript type checking fails
    emptyOutDir: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Improved code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom', 
            'react-redux', 
            '@reduxjs/toolkit'
          ],
          solana: [
            '@solana/web3.js', 
            '@solana/spl-token', 
            '@solana/wallet-adapter-base', 
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui', 
            '@solana/wallet-adapter-wallets'
          ],
          ui: [
            'lucide-react',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs'
          ],
          charts: [
            'chart.js',
            'react-chartjs-2',
            'recharts'
          ]
        }
      }
    }
  }
});
