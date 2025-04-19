import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import tsconfigPaths from 'vite-tsconfig-paths';

// Define APP_LOCALES directly instead of importing from twenty-shared/translations
const APP_LOCALES = {
  'en': 'en',
  'pseudo-en': 'pseudo-en',
  'af-ZA': 'af-ZA',
  'ar-SA': 'ar-SA',
  'ca-ES': 'ca-ES',
  'cs-CZ': 'cs-CZ',
  'da-DK': 'da-DK',
  'de-DE': 'de-DE',
  'el-GR': 'el-GR',
  'es-ES': 'es-ES',
  'fi-FI': 'fi-FI',
  'fr-FR': 'fr-FR',
  'he-IL': 'he-IL',
  'hu-HU': 'hu-HU',
  'it-IT': 'it-IT',
  'ja-JP': 'ja-JP',
  'ko-KR': 'ko-KR',
  'nl-NL': 'nl-NL',
  'no-NO': 'no-NO',
  'pl-PL': 'pl-PL',
  'pt-BR': 'pt-BR',
  'pt-PT': 'pt-PT',
  'ro-RO': 'ro-RO',
  'ru-RU': 'ru-RU',
  'sr-Cyrl': 'sr-Cyrl',
  'sv-SE': 'sv-SE',
  'tr-TR': 'tr-TR',
  'uk-UA': 'uk-UA',
  'vi-VN': 'vi-VN',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
};

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/twenty-emails',

  plugins: [
    externalizeDeps(),
    react({
      plugins: [['@lingui/swc-plugin', {}]],
    }),
    lingui({
      configPath: path.resolve(__dirname, './lingui.config.ts'),
    }),
    tsconfigPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        ...Object.values(APP_LOCALES).reduce(
          (acc, locale) => ({
            ...acc,
            [`locales/generated/${locale}`]: `src/locales/generated/${locale}.ts`,
          }),
          {},
        ),
      },
      name: 'twenty-emails',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime',
        'twenty-shared',
        'twenty-shared/translations',
        'twenty-shared/constants',
        'twenty-shared/testing',
        'twenty-shared/types',
        'twenty-shared/utils',
        'twenty-shared/workspace'
      ],
    },
  },
});
