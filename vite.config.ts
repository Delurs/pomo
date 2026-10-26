import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwinds from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwinds()],
  build: {
    chunkSizeWarningLimit: 600, // Raises warning threshold to 600 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom)[\\/]/.test(id)) {
            return 'vendor';
          }
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          if (id.includes('motion') || id.includes('@animate-ui') || id.includes('@floating-ui')) {
            return 'motion';
          }
        },
      },
    },
  },
});