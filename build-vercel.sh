#!/bin/bash
set -e

echo "Starting custom Vercel build script..."

# Build the translations package first
echo "Building twenty-shared/translations package..."
cd packages/twenty-shared/translations
npm run build
cd ../../..

# Build the shared package next
echo "Building twenty-shared package..."
cd packages/twenty-shared
yarn build
cd ../..

# Build the UI package
echo "Building twenty-ui package..."
cd packages/twenty-ui
yarn build
cd ../..

# Finally build the front-end
echo "Building twenty-front package..."
cd packages/twenty-front
yarn build
cd ../..

echo "Custom build script completed successfully!"