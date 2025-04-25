import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Handler } from '@vercel/node';

// Set max duration for this handler
export const config = {
  maxDuration: 10, // 10 seconds max execution time
};

let cachedServer: any = null;

async function bootstrapServer() {
  if (!cachedServer) {
    // Configure environment variables for database connections
    const databaseUrl = process.env.PG_DATABASE_URL || 
      `postgres://${process.env.POSTGRES_USER || 'postgres'}:${encodeURIComponent(process.env.POSTGRES_PASSWORD || '')}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DATABASE}`;
    
    // For Vercel deployments, we need to ensure the right environment variables are available
    process.env.PG_DATABASE_URL = databaseUrl;
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    
    // Redis connection - essential for caching in a serverless environment
    if (process.env.REDIS_URL) {
      console.log('Redis configured for caching');
    } else {
      console.warn('No REDIS_URL provided - caching may not work properly');
    }
    
    // Use ephemeral filesystem for temporary files
    process.env.STORAGE_LOCAL_PATH = '/tmp/.local-storage';
    
    const app = await NestFactory.create(AppModule, { 
      logger: ['error', 'warn'] 
    });
    
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });
    
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

const handler: Handler = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const server = await bootstrapServer();
    const parsedUrl = parse(req.url || '', true);
    server.emit('request', req, res);
  } catch (error) {
    console.error('API handler error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};

export default handler;