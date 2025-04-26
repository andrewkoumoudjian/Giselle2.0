import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import manifest from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Use paths from the root tsconfig.base.json
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../'),
      '@ui': resolve(__dirname, '../twenty-ui/src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/pages/background/index.ts'),
        popup: resolve(__dirname, 'src/pages/popup/index.html'),
        content: resolve(__dirname, 'src/pages/content/index.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          return `src/pages/${chunk.name}/index.js`;
        },
      },
    },
  },
});
