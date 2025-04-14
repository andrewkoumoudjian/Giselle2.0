import { NestFactory } from '@nestjs/core';

import { exec } from 'child_process';
import { promisify } from 'util';

import { VercelRequest, VercelResponse } from '@vercel/node';

import { AppModule } from '../../../app.module';

const execPromise = promisify(exec);

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed. Use POST.',
      });
    }

    // Simple authentication check - you may want to implement a more secure method
    const authHeader = req.headers.authorization;
    const token = process.env.MIGRATION_SECRET_TOKEN;

    if (
      token &&
      (!authHeader ||
        !authHeader.startsWith('Bearer ') ||
        authHeader.split(' ')[1] !== token)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Run the migrations
    console.log('Starting database migrations...');

    // We need to run both metadata and core migrations
    const results = [];

    try {
      // Run metadata migrations
      const metadataResult = await execPromise(
        'npx -y typeorm migration:run -d dist/src/database/typeorm/metadata/metadata.datasource',
      );

      results.push({
        type: 'metadata',
        success: true,
        output: metadataResult.stdout,
      });
    } catch (error) {
      results.push({
        type: 'metadata',
        success: false,
        error: error.message,
      });
    }

    try {
      // Run core migrations
      const coreResult = await execPromise(
        'npx -y typeorm migration:run -d dist/src/database/typeorm/core/core.datasource',
      );

      results.push({
        type: 'core',
        success: true,
        output: coreResult.stdout,
      });
    } catch (error) {
      results.push({
        type: 'core',
        success: false,
        error: error.message,
      });
    }

    await app.close();

    const allSuccessful = results.every((result) => result.success);

    return res.status(allSuccessful ? 200 : 500).json({
      success: allSuccessful,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error running migrations:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
