import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8081,
    host: true,
    allowedHosts: [
      'unable-sloping-impeding.ngrok-free.dev',
    ],
  },
  preview: {
    port: 8081,
    host: true,
  },
});
