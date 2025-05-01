#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Running Nx plugins fix script...');

// Get the Nx version from package.json
let nxVersion = '22.10.2'; // Default fallback
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  if (packageJson.dependencies && packageJson.dependencies.nx) {
    nxVersion = packageJson.dependencies.nx;
  } else if (packageJson.devDependencies && packageJson.devDependencies.nx) {
    nxVersion = packageJson.devDependencies.nx;
  }
  console.log(`📊 Detected Nx version: ${nxVersion}`);
} catch (error) {
  console.warn(`⚠️ Could not detect Nx version from package.json: ${error.message}`);
  console.log(`📊 Using default Nx version: ${nxVersion}`);
}

try {
  // First try to use nx add to install the plugin
  console.log(`📦 Installing @nx/js using nx add...`);
  try {
    execSync(`npx nx add @nx/js`, { stdio: 'inherit' });
    console.log(`✅ Successfully installed @nx/js using nx add`);
  } catch (e) {
    console.warn(`⚠️ Could not install using nx add: ${e.message}`);

    // Fallback to direct npm install
    console.log(`📦 Falling back to direct install of @nx/js@${nxVersion}...`);
    execSync(`npm install @nx/js@${nxVersion} --no-save`, { stdio: 'inherit' });
    console.log(`✅ Successfully installed @nx/js@${nxVersion} using npm`);
  }

  console.log('✅ Nx plugins fix completed successfully');
} catch (error) {
  console.error('❌ Error in Nx plugins fix script:', error);
  process.exit(1);
}
