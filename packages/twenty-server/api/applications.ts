import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Handler } from '@vercel/node';

let cachedServer: any = null;

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

const handler: Handler = async (req: IncomingMessage, res: ServerResponse) => {
  const server = await bootstrapServer();
  const parsedUrl = parse(req.url || '', true);
  server.emit('request', req, res);
};

export default handler;