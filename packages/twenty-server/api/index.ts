import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

// This is a cached NestJS application instance
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, adapter);
    
    app.enableCors({
      origin: true,
      credentials: true,
    });
    
    await app.init();
    
    cachedApp = app;
  }
  
  return cachedApp;
}

// Export a module that will be used by Vercel as a serverless function
export default async function(req: any, res: any) {
  try {
    await bootstrap();
    
    // Create a serverless handler for Express
    const handler = serverless(expressApp);
    
    // Call the handler with the request and response
    return await handler(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'The server encountered an error while processing your request'
    });
  }
} 