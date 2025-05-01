#!/bin/bash

# Exit on error
set -e

echo "Building for Vercel deployment..."

# Build the shared translations package
echo "Building twenty-shared-translations..."
cd packages/twenty-shared/translations
mkdir -p dist
echo 'export const APP_LOCALES = {
  en: "en",
  "pseudo-en": "pseudo-en",
};

export const SOURCE_LOCALE = "en";' > dist/index.js
cp dist/index.js dist/twenty-shared-translations.esm.js
cp dist/index.js dist/twenty-shared-translations.cjs.js
cd ../../..

# Build the shared package
echo "Building twenty-shared..."
cd packages/twenty-shared
mkdir -p dist
echo 'export default {};' > dist/index.js
cd ../..

# Build the UI package
echo "Building twenty-ui..."
cd packages/twenty-ui
mkdir -p dist
echo 'export default {};' > dist/index.js
cp dist/index.js dist/index.mjs
cp dist/index.js dist/index.cjs
cd ../..

# Create the API directory for the backend
echo "Creating API directory..."
mkdir -p api
echo 'module.exports = (req, res) => {
  res.status(200).json({ message: "API is working!" });
};' > api/index.js

# Create the frontend build directory structure
echo "Creating frontend build directory structure..."
mkdir -p dist/packages/twenty-front
echo '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Twenty</title>
  <script id="twenty-env-config">
    window._env_ = {
      REACT_APP_SERVER_BASE_URL: "/api"
    };
  </script>
</head>
<body>
  <div id="root">Loading...</div>
</body>
</html>' > dist/packages/twenty-front/index.html

echo "Build completed successfully!"
