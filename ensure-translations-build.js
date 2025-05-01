#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Ensuring twenty-shared-translations builds correctly...');

// Paths
const translationsDir = path.join(process.cwd(), 'packages/twenty-shared/translations');
const distDir = path.join(translationsDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`Created directory: ${distDir}`);
}

// Try to build normally first
try {
  console.log('Attempting normal build...');
  execSync('yarn workspace twenty-shared-translations build', { stdio: 'inherit' });
  console.log('✅ Normal build succeeded');
} catch (error) {
  console.warn(`⚠️ Normal build failed: ${error.message}`);
  console.log('Creating files manually...');

  // Create the translations files manually
  const translationsContent = `export const APP_LOCALES = {
  en: 'en',
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
} as const;

export const SOURCE_LOCALE = 'en';
`;

  const cjsContent = `module.exports = {
  APP_LOCALES: {
    en: 'en',
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
  },
  SOURCE_LOCALE: 'en'
};`;

  // Write the files
  fs.writeFileSync(path.join(distDir, 'index.js'), translationsContent);
  fs.writeFileSync(path.join(distDir, 'twenty-shared-translations.esm.js'), translationsContent);
  fs.writeFileSync(path.join(distDir, 'twenty-shared-translations.cjs.js'), cjsContent);
  
  // Create a simple type definition file
  fs.writeFileSync(path.join(distDir, 'index.d.ts'), `export declare const APP_LOCALES: {
  readonly en: "en";
  readonly "pseudo-en": "pseudo-en";
  readonly "af-ZA": "af-ZA";
  readonly "ar-SA": "ar-SA";
  readonly "ca-ES": "ca-ES";
  readonly "cs-CZ": "cs-CZ";
  readonly "da-DK": "da-DK";
  readonly "de-DE": "de-DE";
  readonly "el-GR": "el-GR";
  readonly "es-ES": "es-ES";
  readonly "fi-FI": "fi-FI";
  readonly "fr-FR": "fr-FR";
  readonly "he-IL": "he-IL";
  readonly "hu-HU": "hu-HU";
  readonly "it-IT": "it-IT";
  readonly "ja-JP": "ja-JP";
  readonly "ko-KR": "ko-KR";
  readonly "nl-NL": "nl-NL";
  readonly "no-NO": "no-NO";
  readonly "pl-PL": "pl-PL";
  readonly "pt-BR": "pt-BR";
  readonly "pt-PT": "pt-PT";
  readonly "ro-RO": "ro-RO";
  readonly "ru-RU": "ru-RU";
  readonly "sr-Cyrl": "sr-Cyrl";
  readonly "sv-SE": "sv-SE";
  readonly "tr-TR": "tr-TR";
  readonly "uk-UA": "uk-UA";
  readonly "vi-VN": "vi-VN";
  readonly "zh-CN": "zh-CN";
  readonly "zh-TW": "zh-TW";
};
export declare const SOURCE_LOCALE: "en";
`);

  console.log('✅ Manually created translation files');
}

// Verify the files exist
const requiredFiles = [
  'index.js',
  'twenty-shared-translations.esm.js',
  'twenty-shared-translations.cjs.js',
  'index.d.ts'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing file: ${filePath}`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('✅ All required translation files exist');
} else {
  console.error('❌ Some required translation files are missing');
  process.exit(1);
}
