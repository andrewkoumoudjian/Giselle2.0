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

// List of required Nx plugins
const requiredPlugins = [
  '@nx/js',
  '@nx/eslint',
  '@nx/eslint-plugin',
  '@nx/jest',
  '@nx/node',
  '@nx/react',
  '@nx/vite',
  '@nx/web'
];

// Function to install a plugin
const installPlugin = (plugin) => {
  console.log(`📦 Installing ${plugin}...`);
  try {
    // First try to use nx add
    execSync(`npx nx add ${plugin}`, { stdio: 'inherit' });
    console.log(`✅ Successfully installed ${plugin} using nx add`);
    return true;
  } catch (e) {
    console.warn(`⚠️ Could not install ${plugin} using nx add: ${e.message}`);

    try {
      // Fallback to direct npm install
      console.log(`📦 Falling back to direct install of ${plugin}@${nxVersion}...`);
      execSync(`npm install ${plugin}@${nxVersion} --no-save`, { stdio: 'inherit' });
      console.log(`✅ Successfully installed ${plugin}@${nxVersion} using npm`);
      return true;
    } catch (npmError) {
      console.error(`❌ Failed to install ${plugin}: ${npmError.message}`);
      return false;
    }
  }
};

try {
  // Install all required plugins
  for (const plugin of requiredPlugins) {
    installPlugin(plugin);
  }

  console.log('✅ Nx plugins fix completed successfully');
} catch (error) {
  console.error('❌ Error in Nx plugins fix script:', error);
  process.exit(1);
}
