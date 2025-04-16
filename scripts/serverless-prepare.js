#!/usr/bin/env node

/**
 * This script prepares the environment for serverless deployment
 * by setting necessary environment variables and handling problematic dependencies
 */

const fs = require('fs');
const path = require('path');

// Check if we're in a serverless environment
const isServerless = process.env.IS_SERVERLESS === 'true' || process.env.VERCEL === '1';

// If we're in a serverless environment, make adjustments
if (isServerless) {
  console.log('📦 Preparing for serverless deployment...');
  
  // Set environment variables for the build process
  process.env.SQLITE_DISABLED = 'true';
  process.env.IS_SERVERLESS = 'true';
  
  console.log('✅ Environment prepared for serverless deployment');
  console.log('✅ SQLite disabled in serverless mode');
  
  // Check if we have access to PostgreSQL
  if (!process.env.PG_DATABASE_URL) {
    console.warn('⚠️ No PG_DATABASE_URL found. Serverless deployment requires PostgreSQL.');
    console.warn('⚠️ Set PG_DATABASE_URL in your environment variables.');
  }
  
  // Check if we have access to Redis (via Upstash)
  if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
    console.warn('⚠️ Upstash Redis configuration missing.');
    console.warn('⚠️ Set UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN for message queue support.');
  }
}

console.log('✅ Serverless preparation script completed');