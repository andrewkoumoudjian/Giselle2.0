#!/usr/bin/env node
/**
 * This script fixes SVG imports in the twenty-ui package
 * It converts @assets/icons paths to relative paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Find all icon component files
console.log('Starting import fix process...');
const iconsDir = path.join(ROOT_DIR, 'packages', 'twenty-ui', 'src', 'display', 'icon', 'components');
console.log(`Looking for icon components in: ${iconsDir}`);

if (!fs.existsSync(iconsDir)) {
  console.error(`Directory not found: ${iconsDir}`);
  process.exit(1);
}

const iconFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.tsx'));
console.log(`Found ${iconFiles.length} icon component files`);

// Process each file
let fixedCount = 0;
let checkedCount = 0;

iconFiles.forEach(file => {
  const filePath = path.join(iconsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  checkedCount++;
  
  // Replace @assets/icons with relative path
  if (content.includes('@assets/icons/')) {
    console.log(`Processing: ${file}`);
    
    const newContent = content.replace(
      /@assets\/icons\//g, 
      '../../../assets/icons/'
    );
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      fixedCount++;
      console.log(`  - Fixed imports in: ${file}`);
    }
  }
});

console.log(`\nSummary:`);
console.log(`Checked ${checkedCount} files`);
console.log(`Fixed imports in ${fixedCount} files`);
console.log('Done!'); 