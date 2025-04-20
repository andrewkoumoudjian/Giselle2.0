// Serverless function entry point for Vercel
const serverless = require('serverless-http');
const express = require('express');

// Create Express app
const app = express();

// Setup basic middleware
app.use(express.json());

// CORS headers middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Route handler that will be called for all requests
app.all('*', async (req, res) => {
  try {
    console.log(`[Vercel API] Received ${req.method} request to ${req.url}`);
    
    // Import the NestJS app dynamically to avoid initialization issues
    const { AppModule } = require('../dist/src/app.module');
    const { NestFactory } = require('@nestjs/core');
    
    // Create and configure the NestJS app
    const nestApp = await NestFactory.create(AppModule, { 
      logger: ['error', 'warn', 'log']
    });
    
    // Enable CORS for NestJS
    nestApp.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    });
    
    // Initialize the app
    await nestApp.init();
    
    // Get the underlying HTTP adapter from NestJS
    const httpAdapter = nestApp.getHttpAdapter();
    
    // Forward the request to NestJS
    httpAdapter.getInstance()(req, res);
  } catch (error) {
    console.error('[Vercel API] Error processing request:', error);
    
    // Send error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      path: req.url
    });
  }
});

// Create serverless handler from Express app
const handler = serverless(app);

// Export the handler for Vercel
module.exports = async (req, res) => {
  return handler(req, res);
}; 