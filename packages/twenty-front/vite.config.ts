/* eslint-disable no-console */
import { lingui } from '@lingui/vite-plugin';
import { isNonEmptyString } from '@sniptt/guards';
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import fs from 'fs';
import path, { resolve } from 'path';
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

type Checkers = Parameters<typeof checker>[0];

const ASSET_URL = process.env.ASSET_URL || '';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '');

  const {
    REACT_APP_SERVER_BASE_URL,
    VITE_BUILD_SOURCEMAP,
    VITE_DISABLE_TYPESCRIPT_CHECKER,
    VITE_DISABLE_ESLINT_CHECKER,
    VITE_HOST,
    SSL_CERT_PATH,
    SSL_KEY_PATH,
    REACT_APP_PORT,
  } = env;

  const port = isNonEmptyString(REACT_APP_PORT)
    ? parseInt(REACT_APP_PORT)
    : 3001;

  const isBuildCommand = command === 'build';

  const tsConfigPath = isBuildCommand
    ? path.resolve(__dirname, './tsconfig.build.json')
    : path.resolve(__dirname, './tsconfig.dev.json');

  const checkers: Checkers = {
    overlay: false,
  };

  if (VITE_DISABLE_TYPESCRIPT_CHECKER === 'true') {
    console.log(
      `VITE_DISABLE_TYPESCRIPT_CHECKER: ${VITE_DISABLE_TYPESCRIPT_CHECKER}`,
    );
  }

  if (VITE_DISABLE_ESLINT_CHECKER === 'true') {
    console.log(`VITE_DISABLE_ESLINT_CHECKER: ${VITE_DISABLE_ESLINT_CHECKER}`);
  }

  if (VITE_BUILD_SOURCEMAP === 'true') {
    console.log(`VITE_BUILD_SOURCEMAP: ${VITE_BUILD_SOURCEMAP}`);
  }

  if (VITE_DISABLE_TYPESCRIPT_CHECKER !== 'true') {
    checkers['typescript'] = {
      tsconfigPath: tsConfigPath,
    };
  }

  if (VITE_DISABLE_ESLINT_CHECKER !== 'true') {
    checkers['eslint'] = {
      lintCommand:
        // Appended to packages/twenty-front/.eslintrc.cjs
        'eslint ../../packages/twenty-front --report-unused-disable-directives --max-warnings 0 --config .eslintrc.cjs',
    };
  }

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-front',

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

    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        plugins: [['@swc/plugin-emotion', {}]],
      }),
      tsconfigPaths(),
      nodePolyfills(),
      svgr(),
      lingui({
        configPath: path.resolve(__dirname, './lingui.config.ts'),
      }),
      checker(checkers),
      // TODO: fix this, we have to restrict the include to only the components that are using linaria
      // Otherwise the build will fail because wyw tries to include emotion styled components
      wyw({
        include: [
          '**/CurrencyDisplay.tsx',
          '**/EllipsisDisplay.tsx',
          '**/ContactLink.tsx',
          '**/BooleanDisplay.tsx',
          '**/LinksDisplay.tsx',
          '**/RoundedLink.tsx',
          '**/OverflowingTextWithTooltip.tsx',
          '**/Chip.tsx',
          '**/Tag.tsx',
          '**/MultiSelectFieldDisplay.tsx',
          '**/RatingInput.tsx',
          '**/RecordTableCellContainer.tsx',
          '**/RecordTableCellDisplayContainer.tsx',
          '**/Avatar.tsx',
          '**/RecordTableBodyDroppable.tsx',
          '**/RecordTableCellBaseContainer.tsx',
          '**/RecordTableCellTd.tsx',
          '**/RecordTableTd.tsx',
          '**/RecordTableHeaderDragDropColumn.tsx',
          '**/ActorDisplay.tsx',
          '**/BooleanDisplay.tsx',
          '**/CurrencyDisplay.tsx',
          '**/TextDisplay.tsx',
          '**/EllipsisDisplay.tsx',
          '**/AvatarChip.tsx',
          '**/URLDisplay.tsx',
          '**/EmailsDisplay.tsx',
          '**/PhonesDisplay.tsx',
          '**/MultiSelectDisplay.tsx',
        ],
        babelOptions: {
          presets: ['@babel/preset-typescript', '@babel/preset-react'],
        },
      }),
    ],

    optimizeDeps: {
      exclude: [
        '../../node_modules/.vite',
        '../../node_modules/.cache',
        '../../node_modules/twenty-ui',
      ],
      esbuildOptions: {
        target: 'es2020',
      },
    },

    build: {
      minify: false,
      outDir: 'dist',
      sourcemap: VITE_BUILD_SOURCEMAP === 'true',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('@scalar')) {
              return 'scalar';
            }

            return null;
          },
        },
      },
    },

    envPrefix: 'REACT_APP_',

    define: {
      _env_: {
        REACT_APP_SERVER_BASE_URL,
      },
      'process.env': {
        REACT_APP_SERVER_BASE_URL,
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '~': resolve(__dirname, './src'),
        '@ui': resolve(__dirname, '../twenty-ui/src'),
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        // https://github.com/twentyhq/twenty/pull/10782/files
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
    base: `${ASSET_URL}/`,
    server: {
      port: Number(process.env.PORT) || 3000,
      host: Boolean(process.env.EXTERNAL) === true ? '0.0.0.0' : 'localhost',
      fs: {
        allow: ['..'],
      },
      watch: {
        ignored: ['**/src/generated/**'],
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/testing/setup-tests.ts',
      testTimeout: 10000,
      include: ['src/**/*.test.{js,ts,tsx}'],
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{js,jsx,ts,tsx}'],
        exclude: [
          'src/**/*.stories.tsx',
          'src/generated/**',
          'src/testing/**',
          'src/pages/auth/__tests__/fixtures/**',
        ],
      },
    },
  };
});
