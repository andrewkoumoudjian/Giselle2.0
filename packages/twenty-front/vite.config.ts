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
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: (id) => {
            if (
              id.includes('apollo') ||
              id.includes('lingui') ||
              id.includes('lodash') ||
              id.includes('react-dom') ||
              id.includes('react-hook-form') ||
              id.includes('react-router') ||
              id.includes('slate') ||
              id.includes('tiptap') ||
              id.includes('rxjs') ||
              id.includes('@blocknote/') ||
              id.includes('twenty-shared/') ||
              id.includes('twenty-ui/')
            ) {
              const name = id.split('/').find((segment) => segment.includes('@')) || id;
              const packageName = name.includes('twenty-') ? name : name.split('/')[0];
              return 'vendor_' + packageName;
            }
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
