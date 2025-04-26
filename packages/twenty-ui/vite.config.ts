/// <reference types='vitest' />
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import { glob } from 'glob';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import { UserPluginConfig } from 'vite-plugin-checker/dist/esm/types';

import packageJson from './package.json';

const entries = glob.sync(['src/ui/**/*.ts', 'src/ui/**/*.tsx'], {
  ignore: ['**/*.stories.*', '**/*.test.*', '**/use-*'],
});

const entryFileNames = (chunk: any, extension: string): string => {
  const filename = chunk.name.replace('src/', '');
  return filename + '.' + extension;
};

export default defineConfig(({ mode }) => {
  const checkersConfig: UserPluginConfig = {};

  if (process.env.VITE_DISABLE_TYPESCRIPT_CHECKER !== 'true') {
    checkersConfig.typescript = {
      root: './',
      tsconfigPath: './tsconfig.json',
    };
  }
  if (process.env.VITE_DISABLE_ESLINT_CHECKER !== 'true') {
    checkersConfig.eslint = {
      root: './',
      lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
    };
  }

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
        // Disable SWC's TypeScript checking as we're using vite-plugin-dts
        typescript: {
          skipTypeCheck: true,
        },
      }),
      tsconfigPaths(),
      svgr(),
      dts(dtsConfig),
      checker(checkersConfig),
      wyw({
        tsconfig: './tsconfig.json',
      }),
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
