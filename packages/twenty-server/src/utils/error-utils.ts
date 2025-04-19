/**
 * Error handling utility for consistent error management across the application
 */

import { CustomException } from './custom-exception';

/**
 * Try to execute a function and return the result or handle the error
 * @param fn Function to execute
 * @param errorHandler Optional custom error handler
 * @returns Result of the function or null/handled result if error occurs
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => Promise<T | null> | T | null,
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      return await errorHandler(error as Error);
    }

    // Log error by default
    console.error('Operation failed:', error);

    return null;
  }
};

/**
 * Create a typed error with a specific error code
 * @param message Error message
 * @param code Error code
 * @param context Additional context data
 * @returns CustomException instance
 */
export const createError = (
  message: string,
  code: string,
  context?: Record<string, unknown>,
): CustomException => {
  return new CustomException(message, code, context);
};

/**
 * Determine if an error is of a specific error code
 * @param error Error to check
 * @param code Error code to match
 * @returns Boolean indicating if the error matches the code
 */
export const isErrorCode = (error: unknown, code: string): boolean => {
  return error instanceof CustomException && error.code === code;
};

/**
 * Format an error for consistent logging or display
 * @param error Error to format
 * @returns Formatted error object
 */
export const formatError = (error: unknown): Record<string, unknown> => {
  if (error instanceof CustomException) {
    return {
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
      context: error.context || {},
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  return {
    message: 'Unknown error',
    value: String(error),
  };
};
