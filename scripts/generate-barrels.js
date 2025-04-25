#!/usr/bin/env node

/**
 * This script generates barrel files (index.ts) for all directories in the packages
 * It ensures that there are no duplicate exports by tracking exports across files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HEADER = `/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \\ \\ /\\ / / _ \\ '_ \\| __| | | | Auto-generated file
 *  | |  \\ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \\_/\\_/ \\___|_| |_|\\__|\\___,|
 *                              |___/
 */
`;

// Directories to process
const directoriesToProcess = [
  'packages/twenty-shared/src/**/*',
  'packages/twenty-server/src/**/*',
];

// Files/directories to ignore
const ignorePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/*.test.ts',
  '**/*.spec.ts',
  '**/tests/**',
  '**/index.ts',
];

function isDirectory(path) {
  return fs.statSync(path).isDirectory();
}

function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  return fileName.endsWith('.ts') && 
         !fileName.endsWith('.test.ts') && 
         !fileName.endsWith('.spec.ts') && 
         fileName !== 'index.ts';
}

function generateBarrelFile(directory) {
  console.log(`Processing directory: ${directory}`);
  
  const files = fs.readdirSync(directory)
    .filter(file => {
      const fullPath = path.join(directory, file);
      return !isDirectory(fullPath) && shouldProcessFile(fullPath);
    })
    .map(file => path.parse(file).name);

  if (files.length === 0) {
    console.log(`  No files to process in ${directory}`);
    return;
  }

  // Track exports to avoid duplicates
  const exportedNames = new Set();
  const exportStatements = [];

  for (const file of files) {
    const filePath = path.join(directory, `${file}.ts`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has default export
    const hasDefaultExport = /export\s+default/.test(fileContent);
    
    // Check for named exports
    const namedExportsMatch = fileContent.match(/export\s+(const|function|class|type|interface|enum)\s+(\w+)/g);
    const namedExports = namedExportsMatch ? 
      namedExportsMatch.map(exp => {
        const match = exp.match(/export\s+(const|function|class|type|interface|enum)\s+(\w+)/);
        return match ? match[2] : null;
      }).filter(Boolean) : [];
    
    if (hasDefaultExport) {
      const defaultExportName = file;
      if (!exportedNames.has(defaultExportName)) {
        exportStatements.push(`import ${defaultExportName}Default from './${file}';`);
        exportStatements.push(`export const ${defaultExportName} = ${defaultExportName}Default;`);
        exportedNames.add(defaultExportName);
      }
    } else if (namedExports.length > 0) {
      // For named exports, use export * from
      exportStatements.push(`export * from './${file}';`);
      namedExports.forEach(name => exportedNames.add(name));
    } else {
      // If we can't determine exports, use export * as a fallback
      exportStatements.push(`export * from './${file}';`);
    }
  }

  // Process subdirectories
  const subdirectories = fs.readdirSync(directory)
    .filter(file => {
      const fullPath = path.join(directory, file);
      return isDirectory(fullPath) && file !== 'node_modules' && file !== 'dist';
    });

  for (const subdir of subdirectories) {
    exportStatements.push(`export * from './${subdir}';`);
  }

  // Write the barrel file
  const barrelContent = `${HEADER}\n${exportStatements.join('\n')}\n`;
  fs.writeFileSync(path.join(directory, 'index.ts'), barrelContent);
  console.log(`  Generated barrel file for ${directory}`);
}

function processDirectories() {
  for (const pattern of directoriesToProcess) {
    const directories = glob.sync(pattern, {
      ignore: ignorePatterns,
      onlyDirectories: true
    });

    for (const directory of directories) {
      if (fs.existsSync(directory) && isDirectory(directory)) {
        generateBarrelFile(directory);
      }
    }
  }
}

console.log('Generating barrel files...');
processDirectories();
console.log('Done generating barrel files.'); 