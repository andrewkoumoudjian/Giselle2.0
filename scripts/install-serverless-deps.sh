#!/bin/bash

# This script runs during the Vercel build process to install dependencies for serverless deployment

# Install Upstash Redis client
echo "Installing Upstash Redis client..."
yarn add @upstash/redis

# Install Vercel Node types
echo "Installing Vercel Node types..."
yarn add @vercel/node

echo "Serverless deployment dependencies installed successfully!"