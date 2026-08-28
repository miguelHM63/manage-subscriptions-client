import { resolve } from 'path';
import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useHttps = env.VITE_HTTPS_DEVELOPMENT === 'true';

  return {
    plugins: [react(), tailwindcss(), ...(useHttps ? [basicSsl()] : [])],
    build: {
      target: 'es2022',
    },
    server: {
      port: 3000,
      // Permite exponer el dev server por túneles (p. ej. Cloudflare trycloudflare.com)
      allowedHosts: ['.trycloudflare.com'],
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, './src'),
        },
        {
          find: '@test',
          replacement: resolve(__dirname, './test'),
        },
      ],
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './test.setup.ts',
    },
  } as UserConfig;
});
