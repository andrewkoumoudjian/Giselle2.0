#!/usr/bin/env node
/**
 * This script prepares the project for Vercel deployment
 * It creates the necessary directory structure and files for the twenty-ui package
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TWENTY_UI_DIR = path.join(ROOT_DIR, 'packages', 'twenty-ui');

// Define the UI module directories to create
const UI_MODULES = [
  'display',
  'components',
  'input',
  'navigation',
  'utilities',
  'theme',
  'layout',
  'feedback',
  'json-visualizer'
];

// Create the directories and package.json files
function createDirectories() {
  UI_MODULES.forEach(module => {
    const moduleDir = path.join(TWENTY_UI_DIR, module);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(moduleDir)) {
      console.log(`Creating directory: ${moduleDir}`);
      fs.mkdirSync(moduleDir, { recursive: true });
    }
    
    // Create package.json for the module
    const packageJsonPath = path.join(moduleDir, 'package.json');
    const packageJson = {
      name: `@twenty-ui/${module}`,
      version: '0.1.0',
      main: `../src/${module}/index.ts`,
      types: `../src/${module}/index.ts`,
      sideEffects: false
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Created: ${packageJsonPath}`);
  });
}

// Main execution
try {
  createDirectories();
  console.log('Vercel deployment preparation completed successfully!');
} catch (error) {
  console.error('Error preparing for Vercel deployment:', error);
  process.exit(1);
} 