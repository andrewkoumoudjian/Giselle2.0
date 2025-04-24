#!/bin/bash
set -e

echo "Starting custom Vercel build script..."

# Install monaco-editor to fix TS errors
echo "Installing missing dependencies..."
yarn add monaco-editor --dev

# First build the shared package without translations
echo "Building twenty-shared package..."
cd packages/twenty-shared
yarn build
cd ../..

# Build the UI package
echo "Building twenty-ui package..."
cd packages/twenty-ui
yarn build
cd ../..

# Now build the front-end
echo "Building twenty-front package..."
cd packages/twenty-front
# Set environment variable to bypass translations
export SKIP_TRANSLATIONS=true
yarn build
cd ../..

echo "Custom build script completed successfully!"