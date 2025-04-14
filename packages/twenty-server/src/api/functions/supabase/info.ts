import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * This serverless function provides information about the Supabase database setup
 * Used for diagnostics and setup verification
 */
export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    // Basic authentication check
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

    // Return database configuration information (without sensitive data)
    const databaseInfo = {
      type: 'postgres',
      host:
        process.env.PG_DATABASE_URL?.split('@')[1]?.split(':')[0] ||
        'Not configured',
      database: 'postgres', // Supabase default
      schema: process.env.DATA_SOURCE_CORE_TABLE_SCHEMA || 'public',
      metadataSchema: process.env.DATA_SOURCE_METADATA_TABLE_SCHEMA || 'public',
      isConfigured: !!process.env.PG_DATABASE_URL,
      serverlessMode: process.env.IS_SERVERLESS === 'true',
    };

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      database: databaseInfo,
      environment: process.env.VERCEL_ENV || 'development',
    });
  } catch (error) {
    console.error('Error in Supabase info endpoint:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
