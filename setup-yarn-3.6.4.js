#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Default to Yarn 4.4.0, but allow specifying a different version
const targetYarnVersion = process.env.YARN_VERSION || '4.4.0';

console.log(`🔧 Setting up Yarn ${targetYarnVersion}...`);

try {
  // Create .yarn/releases directory if it doesn't exist
  const releasesDir = path.join(process.cwd(), '.yarn/releases');
  if (!fs.existsSync(releasesDir)) {
    fs.mkdirSync(releasesDir, { recursive: true });
  }
  
  // Check for target Yarn version
  const yarnPath = path.join(releasesDir, `yarn-${targetYarnVersion}.cjs`);
  if (!fs.existsSync(yarnPath)) {
    console.log(`Downloading Yarn ${targetYarnVersion}...`);
    execSync(`curl -o .yarn/releases/yarn-${targetYarnVersion}.cjs -L https://github.com/yarnpkg/berry/releases/download/${targetYarnVersion}/yarn-${targetYarnVersion}.cjs`, { stdio: 'inherit' });
    
    // Update .yarnrc.yml to point to the correct version
    const yarnrcPath = path.join(process.cwd(), '.yarnrc.yml');
    if (fs.existsSync(yarnrcPath)) {
      let yarnrcContent = fs.readFileSync(yarnrcPath, 'utf8');
      yarnrcContent = yarnrcContent.replace(/yarnPath:.*/, `yarnPath: ".yarn/releases/yarn-${targetYarnVersion}.cjs"`);
      fs.writeFileSync(yarnrcPath, yarnrcContent);
      console.log(`Updated .yarnrc.yml to use Yarn ${targetYarnVersion}`);
    } else {
      fs.writeFileSync(yarnrcPath, `yarnPath: ".yarn/releases/yarn-${targetYarnVersion}.cjs"\n`);
      console.log(`Created .yarnrc.yml with Yarn ${targetYarnVersion} configuration`);
    }
  } else {
    console.log(`Yarn ${targetYarnVersion} already downloaded`);
  }
  
  // Update packageManager field in package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.packageManager !== `yarn@${targetYarnVersion}`) {
    const oldPackageManager = packageJson.packageManager;
    packageJson.packageManager = `yarn@${targetYarnVersion}`;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated packageManager from "${oldPackageManager}" to "yarn@${targetYarnVersion}" in package.json`);
  } else {
    console.log(`packageManager already set to yarn@${targetYarnVersion} in package.json`);
  }
  
  console.log(`✅ Yarn ${targetYarnVersion} setup completed successfully`);
} catch (error) {
  console.error(`❌ Error setting up Yarn ${targetYarnVersion}:`, error);
  process.exit(1);
}
