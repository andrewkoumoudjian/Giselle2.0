#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Yarn 3.6.4...');

try {
  // Create .yarn/releases directory if it doesn't exist
  const releasesDir = path.join(process.cwd(), '.yarn/releases');
  if (!fs.existsSync(releasesDir)) {
    fs.mkdirSync(releasesDir, { recursive: true });
  }
  
  // Check for Yarn 3.6.4
  const yarnPath = path.join(releasesDir, 'yarn-3.6.4.cjs');
  if (!fs.existsSync(yarnPath)) {
    console.log('Downloading Yarn 3.6.4...');
    execSync('curl -o .yarn/releases/yarn-3.6.4.cjs -L https://github.com/yarnpkg/berry/releases/download/3.6.4/yarn-3.6.4.cjs', { stdio: 'inherit' });
    
    // Update .yarnrc.yml to point to the correct version
    const yarnrcPath = path.join(process.cwd(), '.yarnrc.yml');
    if (fs.existsSync(yarnrcPath)) {
      let yarnrcContent = fs.readFileSync(yarnrcPath, 'utf8');
      yarnrcContent = yarnrcContent.replace(/yarnPath:.*/, 'yarnPath: ".yarn/releases/yarn-3.6.4.cjs"');
      fs.writeFileSync(yarnrcPath, yarnrcContent);
      console.log('Updated .yarnrc.yml to use Yarn 3.6.4');
    } else {
      fs.writeFileSync(yarnrcPath, 'yarnPath: ".yarn/releases/yarn-3.6.4.cjs"\n');
      console.log('Created .yarnrc.yml with Yarn 3.6.4 configuration');
    }
  } else {
    console.log('Yarn 3.6.4 already downloaded');
  }
  
  // Update packageManager field in package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.packageManager !== 'yarn@3.6.4') {
    const oldPackageManager = packageJson.packageManager;
    packageJson.packageManager = 'yarn@3.6.4';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated packageManager from "${oldPackageManager}" to "yarn@3.6.4" in package.json`);
  } else {
    console.log('packageManager already set to yarn@3.6.4 in package.json');
  }
  
  console.log('✅ Yarn 3.6.4 setup completed successfully');
} catch (error) {
  console.error('❌ Error setting up Yarn 3.6.4:', error);
  process.exit(1);
}
