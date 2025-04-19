/* eslint-disable no-console */
import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

type Checkers = Parameters<typeof checker>[0];

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '');

  const isBuild = command === 'build';
  const isCoverage = mode === 'coverage';
  const isCI = Boolean(env.CI);
  const isVitestUI = Boolean(env.VITEST_UI);

  const port = env.PORT ? parseInt(env.PORT, 10) : 3000;
  const VITE_HOST = env.VITE_HOST;
  const SSL_KEY_PATH = env.SSL_KEY_PATH;
  const SSL_CERT_PATH = env.SSL_CERT_PATH;

  const checkers: Checkers = {};

  if (!isBuild && !env.VITE_DISABLE_ESLINT_CHECKER) {
    console.log('Enabling ESLint checker in dev mode');
    checkers.eslint = {
      lintCommand: `${isCoverage ? '' : 'TIMING=1 '}eslint --ext ts,tsx "src/**/*{ts,tsx}"`,
      dev: {
        logLevel: ['warning', 'error'],
      },
    };
  }

  if (!isBuild && !env.VITE_DISABLE_TYPESCRIPT_CHECKER) {
    console.log('Enabling TypeScript checker in dev mode');
    checkers.typescript = {
      root: '../../',
      tsconfigPath: `${__dirname}/tsconfig.json`,
      buildMode: false,
    };
  }

  const plugins = [
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@lingui/swc-plugin', {}]],
    }),
    tsconfigPaths({
      projects: ['tsconfig.json'],
    }),
    svgr({
      svgrOptions: {
        ref: true,
      },
      include: ['**/*.svg?react', '../twenty-ui/src/assets/icons/*.svg'],
    }),
    lingui({
      configPath: path.resolve(__dirname, './lingui.config.ts'),
    }),
    checker(checkers),
  ];

  if (!isBuild) {
    plugins.push(wyw());
  }

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-front',
    publicDir: 'public',

    server: {
      port: port,
      ...(VITE_HOST ? { host: VITE_HOST } : {}),
      ...(SSL_KEY_PATH && SSL_CERT_PATH
        ? {
            protocol: 'https',
            https: {
              key: fs.readFileSync(env.SSL_KEY_PATH),
              cert: fs.readFileSync(env.SSL_CERT_PATH),
            },
          }
        : {
            protocol: 'http',
          }),
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          '**/@blocknote/core/src/fonts/**',
        ],
      },
    },

    plugins,

    test: {
      globals: true,
      environment: 'jsdom',
      console: true,
      updateSnapshot: isCI,
      coverage: isCoverage
        ? {
            provider: 'istanbul',
            exclude: [
              'node_modules/**',
              'src/generated/**',
              'src/**/*.spec.{ts,tsx}',
              'src/**/*.stories.tsx',
              'src/__tests__/**',
              'src/__mocks__/**',
            ],
            reporter: [isVitestUI ? 'text' : 'json', 'lcov'],
          }
        : undefined,
      passWithNoTests: true,
      setupFiles: ['./setupTests.ts'],
      ...(isCI
        ? {
            maxWorkers: 1,
            minWorkers: 1,
          }
        : {
            minWorkers: 1,
          }),
      onConsoleLog(log: string) {
        if (
          log.includes('[MobX]') ||
          log.includes('react-virtuoso') ||
          log.includes("[react-virtuoso] can't measure the") ||
          log.includes('ag-grid') ||
          log.includes('Duplicate atom key')
        ) {
          return false;
        }
      },
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 2000,
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('apollo')) return 'vendor_apollo';
              if (id.includes('lingui')) return 'vendor_lingui';
              if (id.includes('lodash')) return 'vendor_lodash';
              if (id.includes('react-dom')) return 'vendor_react-dom';
              if (id.includes('react-hook-form')) return 'vendor_react-hook-form';
              if (id.includes('react-router')) return 'vendor_react-router';
              if (id.includes('slate')) return 'vendor_slate';
              if (id.includes('tiptap')) return 'vendor_tiptap';
              if (id.includes('rxjs')) return 'vendor_rxjs';
              if (id.includes('@blocknote/')) return 'vendor_blocknote';
              if (id.includes('@emotion/')) return 'vendor_emotion';
              if (id.includes('@tabler/')) return 'vendor_tabler';
              if (id.includes('framer-motion')) return 'vendor_framer-motion';
              
              const fileName = id.split('/').pop() || '';
              const firstChar = fileName.charAt(0).toLowerCase();
              
              if (firstChar.match(/[a-d]/)) return 'vendor_a-d';
              if (firstChar.match(/[e-h]/)) return 'vendor_e-h';
              if (firstChar.match(/[i-l]/)) return 'vendor_i-l';
              if (firstChar.match(/[m-p]/)) return 'vendor_m-p';
              if (firstChar.match(/[q-t]/)) return 'vendor_q-t';
              if (firstChar.match(/[u-z]/)) return 'vendor_u-z';
              
              return 'vendor_misc';
            }
            
            if (id.includes('twenty-shared/')) return 'twenty-shared';
            if (id.includes('twenty-ui/')) return 'twenty-ui';
            
            return undefined;
          },
        },
      },
    },

    optimizeDeps: {
      exclude: ['twenty-shared', 'twenty-ui'],
      include: ['../twenty-ui/src/assets/icons/*.svg'],
    },

    resolve: {
      alias: {
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        // https://github.com/twentyhq/twenty/pull/10782/files
        // This will likely be migrated to twenty-ui package when built separately
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
        '@ui': path.resolve(__dirname, '../twenty-ui/src'),
        '@assets': path.resolve(__dirname, '../twenty-ui/src/assets'),
        'twenty-ui': path.resolve(__dirname, '../twenty-ui/src'),
        'twenty-ui/display': path.resolve(__dirname, '../twenty-ui/src/display'),
        'twenty-ui/components': path.resolve(__dirname, '../twenty-ui/src/components'),
        'twenty-ui/input': path.resolve(__dirname, '../twenty-ui/src/input'),
        'twenty-ui/navigation': path.resolve(__dirname, '../twenty-ui/src/navigation'),
        'twenty-ui/utilities': path.resolve(__dirname, '../twenty-ui/src/utilities'),
        'twenty-ui/theme': path.resolve(__dirname, '../twenty-ui/src/theme'),
        'twenty-shared': path.resolve(__dirname, '../twenty-shared'),
        'twenty-shared/translations': path.resolve(__dirname, '../twenty-shared/translations'),
        'twenty-shared/constants': path.resolve(__dirname, '../twenty-shared/constants'),
        'twenty-shared/testing': path.resolve(__dirname, '../twenty-shared/testing'),
        'twenty-shared/types': path.resolve(__dirname, '../twenty-shared/types'),
        'twenty-shared/utils': path.resolve(__dirname, '../twenty-shared/utils'),
        'twenty-shared/workspace': path.resolve(__dirname, '../twenty-shared/workspace')
      },
    },
  };
});
