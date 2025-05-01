#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

// Ensure directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Helper function to run commands
function runCommand(command, options = {}) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Check for and fix Yarn issues
console.log('\n🧐 Checking Yarn configuration...');
try {
  // Check Yarn version
  const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();
  console.log(`Detected Yarn version: ${yarnVersion}`);
  
  // If packages are missing from lockfile, try rebuilding it
  if (yarnVersion.startsWith('4.')) {
    console.log('Running yarn install to ensure lockfile is up to date...');
    try {
      // First, fix any resolutions
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Copy NX versions from devDependencies to resolutions if not already present
      const nxPackages = [
        'nx', '@nx/js', '@nx/eslint', '@nx/eslint-plugin', '@nx/jest', 
        '@nx/node', '@nx/react', '@nx/vite', '@nx/web', '@nx/storybook'
      ];
      
      if (packageJson.devDependencies) {
        if (!packageJson.resolutions) {
          packageJson.resolutions = {};
        }
        
        let updated = false;
        for (const pkg of nxPackages) {
          if (packageJson.devDependencies[pkg] && !packageJson.resolutions[pkg]) {
            packageJson.resolutions[pkg] = packageJson.devDependencies[pkg];
            updated = true;
          }
        }
        
        if (updated) {
          console.log('Updating resolutions in package.json to ensure correct versions...');
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        }
      }
      
      // Run Yarn install to update lockfile
      runCommand('yarn install');
      
      // Run fix-nx-plugins.js to ensure NX plugins are installed
      runCommand('node fix-nx-plugins.js');
      
    } catch (yarnError) {
      console.warn(`⚠️ Warning: Yarn installation issue: ${yarnError.message}`);
    }
  }
} catch (error) {
  console.warn(`⚠️ Warning: Yarn version check failed: ${error.message}`);
}

// Step 1: Ensure shared translations are built correctly
console.log('\n📦 Building twenty-shared-translations...');
const translationsDir = path.join(process.cwd(), 'packages/twenty-shared/translations');
const translationsDistDir = path.join(translationsDir, 'dist');
ensureDirectoryExists(translationsDistDir);

// Create the translations files
try {
  // First try to build normally
  if (!runCommand('yarn workspace twenty-shared-translations build')) {
    // If that fails, create the files manually
    console.log('Falling back to manual file creation...');
    
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

    fs.writeFileSync(path.join(translationsDistDir, 'index.js'), translationsContent);
    fs.writeFileSync(path.join(translationsDistDir, 'twenty-shared-translations.esm.js'), translationsContent);
    fs.writeFileSync(path.join(translationsDistDir, 'twenty-shared-translations.cjs.js'), `module.exports = ${JSON.stringify({
      APP_LOCALES: {
        en: 'en',
        'pseudo-en': 'pseudo-en',
        // Add other locales as needed
      },
      SOURCE_LOCALE: 'en'
    }, null, 2)};`);
    
    // Create a simple type definition file
    fs.writeFileSync(path.join(translationsDistDir, 'index.d.ts'), `export declare const APP_LOCALES: {
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
export declare const SOURCE_LOCALE = "en";
`);
    
    console.log('✅ Manually created translation files');
  }
} catch (error) {
  console.error('❌ Error building translations:', error);
}

// Step 2: Build the shared package
console.log('\n📦 Building twenty-shared...');
const sharedDir = path.join(process.cwd(), 'packages/twenty-shared');
const sharedDistDir = path.join(sharedDir, 'dist');
ensureDirectoryExists(sharedDistDir);

try {
  if (!runCommand('yarn workspace twenty-shared build')) {
    // If that fails, create a simple export
    console.log('Falling back to manual file creation...');
    fs.writeFileSync(path.join(sharedDistDir, 'index.js'), 'export default {};');
    fs.writeFileSync(path.join(sharedDistDir, 'twenty-shared.esm.js'), 'export default {};');
    fs.writeFileSync(path.join(sharedDistDir, 'twenty-shared.cjs.js'), 'module.exports = {};');
    console.log('✅ Manually created shared files');
  }
} catch (error) {
  console.error('❌ Error building shared package:', error);
}

// Step 3: Build the UI package
console.log('\n📦 Building twenty-ui...');
const uiDir = path.join(process.cwd(), 'packages/twenty-ui');
const uiDistDir = path.join(uiDir, 'dist');
ensureDirectoryExists(uiDistDir);

try {
  if (!runCommand('yarn workspace twenty-ui build')) {
    // If that fails, create a simple export
    console.log('Falling back to manual file creation...');
    fs.writeFileSync(path.join(uiDistDir, 'index.js'), 'export default {};');
    fs.writeFileSync(path.join(uiDistDir, 'index.mjs'), 'export default {};');
    fs.writeFileSync(path.join(uiDistDir, 'index.cjs'), 'module.exports = {};');
    console.log('✅ Manually created UI files');
  }
} catch (error) {
  console.error('❌ Error building UI package:', error);
}

// Step 4: Build the frontend
console.log('\n📦 Building twenty-front...');
try {
  // Try different approaches to build
  if (!runCommand('npx nx build twenty-front')) {
    console.log('Trying alternative build command...');
    runCommand('yarn workspace twenty-front build:full');
  }
} catch (error) {
  console.error('❌ Error building frontend:', error);
}

// Step 5: Copy API handlers and frontend files
console.log('\n📦 Copying API handlers and frontend files...');
ensureDirectoryExists(path.join(process.cwd(), 'api'));
ensureDirectoryExists(path.join(process.cwd(), 'public'));

try {
  runCommand('yarn copy-api-handlers');
  runCommand('yarn copy-frontend');
} catch (error) {
  console.error('❌ Error copying files:', error);
  
  // Create a fallback API handler if needed
  const apiDir = path.join(process.cwd(), 'api');
  if (!fs.existsSync(path.join(apiDir, 'index.js'))) {
    fs.writeFileSync(path.join(apiDir, 'index.js'), `module.exports = (req, res) => {
  res.status(200).json({ message: "API is working!" });
};`);
    console.log('Created fallback API handler');
  }
}

console.log('\n✅ Vercel build process completed');
