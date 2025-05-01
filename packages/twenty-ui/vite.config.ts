/// <reference types='vitest' />
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import packageJson from './package.json';

const entries = ['src/index.ts'];

const entryFileNames = (chunk: any, extension: string): string => {
  const filename = chunk.name.replace('src/', '');
  return filename + '.' + extension;
};

export default defineConfig(({ mode }) => {
  // No checkers config

  const dtsConfig = {
    include: ['src'],
    beforeWriteFile: (filePath, content) => {
      return {
        filePath,
        content: content
          .replace('import { CSSObject } from "@emotion/react"', '')
          .replace(/import ".+\.css";/g, ''),
      };
    },
  };

  return {
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    optimizeDeps: {
      exclude: ['../../node_modules/.vite', '../../node_modules/.cache'],
    },
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-ui',
    assetsInclude: ['src/**/*.svg'],
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        plugins: [['@swc/plugin-emotion', {}]],
        tsDecorators: true,
      }),
      tsconfigPaths(),
      svgr(),
      dts(dtsConfig),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, '../../'),
        '@ui': resolve(__dirname, './src'),
      },
    },

    // Configuration for building your library.
    // See: https://vitejs.dev/guide/build.html#library-mode
    build: {
      target: 'es2022',
      minify: mode === 'production',
      sourcemap: mode === 'development',
      emptyOutDir: true,
      outDir: 'dist',
      lib: {
        entry: ['src/index.ts', ...entries],
        name: 'twenty-ui',
      },
      rollupOptions: {
        external: Object.keys(packageJson.dependencies || {}),
        output: [
          {
            assetFileNames: 'style.css',
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              '@emotion/react': 'emotionReact',
              '@emotion/styled': 'emotionStyled',
            },
            format: 'es',
            entryFileNames: (chunk) => entryFileNames(chunk, 'mjs'),
          },
          {
            assetFileNames: 'style.css',
            format: 'cjs',
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              '@emotion/react': 'emotionReact',
              '@emotion/styled': 'emotionStyled',
            },
            interop: 'auto',
            esModule: true,
            exports: 'named',
            entryFileNames: (chunk) => entryFileNames(chunk, 'cjs'),
          },
        ],
      },
    },
  };
});
