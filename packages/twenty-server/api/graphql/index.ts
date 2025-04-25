import { NestFactory } from '@nestjs/core';
import { Handler } from '@vercel/node';
import { AppModule } from '../../src/app.module';

// Set max duration for this handler
export const config = {
  maxDuration: 10, // 10 seconds max execution time
};

// Cache instance of NestJS server to improve cold starts
let cachedServer: any = null;

async function bootstrapServer() {
  if (!cachedServer) {
    // Use environment variables from Vercel
    const app = await NestFactory.create(AppModule, { 
      logger: ['error', 'warn']  // Structured logging for Vercel
    });
    
    // Configure app with environment variables
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });
    
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

const handler: Handler = async (req, res) => {
  try {
    // For GraphQL, we're specifically targeting this path
    if (req.url && !req.url.endsWith('/graphql')) {
      req.url = '/graphql';
    }
    
    const server = await bootstrapServer();
    server.emit('request', req, res);
  } catch (error) {
    // Handle errors gracefully
    console.error('GraphQL API error:', error);
    res.status(500).json({
      errors: [{ message: 'Internal server error' }]
    });
  }
};

export default handler;