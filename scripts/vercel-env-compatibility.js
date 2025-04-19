#!/usr/bin/env node
/**
 * This script ensures environment variable compatibility in Vercel
 * It maps environment variables to the format expected by the application
 */

// Map DB_URL from Vercel Postgres URL if not set
if (!process.env.DB_URL && process.env.POSTGRES_URL) {
  console.log('Setting DB_URL from POSTGRES_URL');
  process.env.DB_URL = process.env.POSTGRES_URL;
}

// Ensure all Supabase variables are set
if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('Setting SUPABASE_URL from NEXT_PUBLIC_SUPABASE_URL');
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
}

if (!process.env.SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Setting SUPABASE_ANON_KEY from NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.env.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

// Ensure Redis variables are properly set
if (!process.env.REDIS_URL && process.env.REDIS_HOST) {
  console.log('Constructing REDIS_URL from REDIS_HOST and REDIS_PASSWORD');
  const host = process.env.REDIS_HOST;
  const password = process.env.REDIS_PASSWORD || '';
  
  if (password) {
    process.env.REDIS_URL = `redis://:${password}@${host}:6379`;
  } else {
    process.env.REDIS_URL = `redis://${host}:6379`;
  }
}

// Log environment variables for debugging (redacted for security)
console.log('Environment variable setup completed');
console.log('DB_URL is set:', !!process.env.DB_URL);
console.log('SUPABASE_URL is set:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY is set:', !!process.env.SUPABASE_ANON_KEY);
console.log('REDIS_URL is set:', !!process.env.REDIS_URL);
console.log('REDIS_HOST is set:', !!process.env.REDIS_HOST);

// Set serverless flag
process.env.IS_SERVERLESS = 'true'; 