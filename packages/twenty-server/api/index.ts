import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';

// Create Express app instance
const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

// This is a cached NestJS application instance
let cachedApp: any;
let isInitializing = false;
let initializationPromise: Promise<any> | null = null;

async function bootstrap() {
  // If app is already cached, return it
  if (cachedApp) {
    return cachedApp;
  }

  // If initialization is already in progress, return the promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Set flag and create initialization promise
  isInitializing = true;
  initializationPromise = (async () => {
    try {
      console.log('Initializing NestJS application...');
      
      // Create NestJS app with Express adapter
      const app = await NestFactory.create(AppModule, adapter, {
        logger: ['error', 'warn', 'log'],
      });
      
      // Configure CORS to allow requests from anywhere
      app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
      });
      
      // Initialize the app
      await app.init();
      console.log('NestJS application initialized successfully');
      
      // Save app to cache
      cachedApp = app;
      return app;
    } catch (error) {
      console.error('Failed to initialize NestJS application:', error);
      // Reset flags to allow retry
      initializationPromise = null;
      isInitializing = false;
      throw error;
    }
  })();

  return initializationPromise;
}

// Pre-initialize the app on cold start
bootstrap().catch(err => {
  console.error('Pre-initialization failed:', err);
});

// Export a module that will be used by Vercel as a serverless function
export default async function(req: any, res: any) {
  try {
    // Handle preflight OPTIONS requests immediately
    if (req.method === 'OPTIONS') {
      res.status(200).set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      }).send('OK');
      return;
    }
    
    console.log(`Processing ${req.method} request to ${req.url}`);
    
    // Ensure app is initialized
    await bootstrap();
    
    // Create a serverless handler for Express
    const handler = serverless(expressApp);
    
    // Call the handler with the request and response
    return await handler(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    console.error('Error stack:', error.stack);
    
    // Send a detailed error response
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
} 