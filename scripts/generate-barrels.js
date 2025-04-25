#!/usr/bin/env node

/**
 * This script generates barrel files (index.ts) for utility directories.
 * It avoids creating duplicate exports by checking for naming conflicts.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SHARED_UTILS_DIR = path.resolve(__dirname, '../packages/twenty-shared/src/utils');
const BARREL_HEADER = `/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \\ \\ /\\ / / _ \\ '_ \\| __| | | | Auto-generated file
 *  | |  \\ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \\_/\\_/ \\___|_| |_|\\__|\\___, |
 *                              |___/
 */
`;

// Track all exports to avoid duplicates
const allExports = new Set();
const exportConflicts = [];

function isDirectory(source) {
  return fs.lstatSync(source).isDirectory();
}

function getSubdirectories(directory) {
  return fs.readdirSync(directory)
    .map(name => path.join(directory, name))
    .filter(isDirectory);
}

function isTypeScriptFile(file) {
  return file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.endsWith('.test.ts');
}

function extractExportName(filePath) {
  const fileName = path.basename(filePath, '.ts');
  return fileName;
}

function generateBarrelFile(directory) {
  const files = fs.readdirSync(directory)
    .filter(file => isTypeScriptFile(file) && file !== 'index.ts');
  
  const subdirectories = fs.readdirSync(directory)
    .filter(file => isDirectory(path.join(directory, file)));
  
  let exports = [];
  
  // Add exports for each file
  files.forEach(file => {
    const exportName = extractExportName(file);
    const relativePath = `./${exportName}`;
    
    // Check for conflicts
    if (allExports.has(exportName)) {
      exportConflicts.push({
        name: exportName,
        path: path.relative(SHARED_UTILS_DIR, path.join(directory, file))
      });
    } else {
      allExports.add(exportName);
      exports.push(`export { default as ${exportName} } from '${relativePath}';`);
    }
  });
  
  // Add exports for each subdirectory
  subdirectories.forEach(subdir => {
    const relativePath = `./${subdir}`;
    exports.push(`export * from '${relativePath}';`);
  });
  
  // Write the barrel file
  const content = `${BARREL_HEADER}\n${exports.join('\n')}\n`;
  fs.writeFileSync(path.join(directory, 'index.ts'), content);
  
  console.log(`Generated barrel file for ${path.relative(SHARED_UTILS_DIR, directory)}`);
}

// Recursively process all directories
function processDirectory(directory) {
  generateBarrelFile(directory);
  
  const subdirectories = getSubdirectories(directory);
  subdirectories.forEach(processDirectory);
}

// Main execution
console.log('Generating barrel files...');
processDirectory(SHARED_UTILS_DIR);

// Report conflicts
if (exportConflicts.length > 0) {
  console.warn('\nWarning: Export name conflicts detected:');
  exportConflicts.forEach(conflict => {
    console.warn(`- ${conflict.name} in ${conflict.path}`);
  });
  console.warn('\nPlease rename these files to avoid conflicts, or update their exports');
}

console.log('\nBarrel file generation complete!'); 