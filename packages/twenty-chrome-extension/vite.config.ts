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
    tsconfigPaths({ root: '../../' }), // point to workspace root tsconfig.json
    crx({ manifest }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, '../../') },
      { find: '@/ui', replacement: resolve(__dirname, '../twenty-ui/src/ui') }
    ]
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
