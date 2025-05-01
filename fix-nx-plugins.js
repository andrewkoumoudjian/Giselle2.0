#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Running Nx plugins fix script...');

// Ensure correct NX version matches
const NX_VERSION = '22.10.2';

try {
  console.log(`📦 Installing @nx/js@${NX_VERSION}...`);
  execSync(`npm install @nx/js@${NX_VERSION} --no-save`, { stdio: 'inherit' });
  
  console.log('✅ Nx plugins fix completed successfully');
} catch (error) {
  console.error('❌ Error in Nx plugins fix script:', error);
  process.exit(1);
}
