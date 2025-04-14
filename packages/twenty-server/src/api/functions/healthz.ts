import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * A simple health check endpoint for serverless deployment
 * This helps verify that the deployment is working properly
 */
export default async function (req: VercelRequest, res: VercelResponse) {
  const environment = process.env.VERCEL_ENV || 'development';
  const isServerless = process.env.IS_SERVERLESS === 'true';

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment,
    serverless: isServerless,
    message: 'Giselle 2.0 API is running in serverless mode',
  });
}
