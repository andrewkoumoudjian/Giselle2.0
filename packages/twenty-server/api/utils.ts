/**
 * Constructs a Redis URL from environment variables
 * This allows us to use either REDIS_URL directly or construct it from REDIS_HOST and REDIS_PASSWORD
 */
export function getRedisUrl(): string {
  // If REDIS_URL is directly provided, use it
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  
  // Otherwise construct from host and password
  const host = process.env.REDIS_HOST;
  const password = process.env.REDIS_PASSWORD;
  
  if (!host) {
    throw new Error('Either REDIS_URL or REDIS_HOST must be provided');
  }
  
  // Construct URL with optional password
  if (password) {
    return `redis://:${password}@${host}:6379`;
  }
  
  return `redis://${host}:6379`;
} 