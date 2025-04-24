#!/bin/bash

# Build all packages in the correct order
echo "Building twenty-shared..."
cd packages/twenty-shared && yarn build

echo "Building twenty-ui..."
cd ../twenty-ui && yarn build

echo "Building twenty-front..."
cd ../twenty-front && yarn build

echo "Build completed successfully!"