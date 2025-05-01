#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Vercel deployment environment...');

// Set up Yarn 3.6.4
try {
  console.log('Setting up Yarn 3.6.4...');
  execSync('node setup-yarn-3.6.4.js', { stdio: 'inherit' });
  console.log('✅ Yarn 3.6.4 setup completed');
} catch (error) {
  console.error('❌ Error setting up Yarn 3.6.4:', error);
  process.exit(1);
}

// Set up Yarn configuration
try {
  console.log('Setting up Yarn configuration...');

  // Create or update .yarnrc.yml
  const yarnrcPath = path.join(process.cwd(), '.yarnrc.yml');
  const yarnrcContent = `
yarnPath: ".yarn/releases/yarn-3.6.4.cjs"
enableImmutableInstalls: false
npmRegistryServer: "https://registry.npmjs.org"
nodeLinker: "node-modules"
enableGlobalCache: false

logFilters:
  - code: YN0002
    level: discard
  - code: YN0060
    level: discard
  - code: YN0006
    level: discard
  - code: YN0076
    level: discard
  - code: YN0013
    level: discard
  - code: YN0082
    level: warning
`;

  fs.writeFileSync(yarnrcPath, yarnrcContent.trim());
  console.log('✅ Yarn configuration updated');
} catch (error) {
  console.error('❌ Error setting up Yarn configuration:', error);
  process.exit(1);
}

// Run fix-nx-plugins.js to install required Nx plugins
try {
  console.log('Running fix-nx-plugins.js to install required Nx plugins...');
  execSync('node fix-nx-plugins.js', { stdio: 'inherit' });
  console.log('✅ Required Nx plugins installed');
} catch (error) {
  console.error('❌ Error installing Nx plugins:', error);
  process.exit(1);
}

// Run yarn install to update the lockfile
try {
  console.log('Running yarn install to update the lockfile...');
  execSync('yarn install', { stdio: 'inherit' });
  console.log('✅ Yarn install completed successfully');
} catch (error) {
  console.error('❌ Error running yarn install:', error);
  process.exit(1);
}

console.log('✅ Vercel deployment environment setup completed');
