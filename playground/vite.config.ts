import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/lumen-design/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@luokuiai/lumen-theme-clarity': resolve(__dirname, '../packages/lumen-theme-clarity/clarity.css'),
      '@luokuiai/lumen-ui': resolve(__dirname, '../packages/lumen-ui/src/index.ts'),
      'lucide-react': resolve(__dirname, '../packages/lumen-ui/node_modules/lucide-react'),
      react: resolve(__dirname, '../packages/lumen-ui/node_modules/react'),
      'react-dom': resolve(__dirname, '../packages/lumen-ui/node_modules/react-dom'),
      'react-dom/client': resolve(__dirname, '../packages/lumen-ui/node_modules/react-dom/client'),
      'react/jsx-runtime': resolve(__dirname, '../packages/lumen-ui/node_modules/react/jsx-runtime'),
    },
  },
});
