/**
 * Error handling utilities for the frontend application
 */

/**
 * Standard error codes used throughout the application
 */
export enum ErrorCode {
  // API related errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',

  // Data validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Application errors
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}

/**
 * Application error with typed error code and metadata
 */
export class AppError extends Error {
  code: ErrorCode | string;
  metadata?: Record<string, unknown>;
  timestamp: string;

  constructor(
    message: string,
    code: ErrorCode | string,
    metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Creates a new application error with the specified code and message
 */
export const createError = (
  message: string,
  code: ErrorCode | string,
  metadata?: Record<string, unknown>,
): AppError => {
  return new AppError(message, code, metadata);
};

/**
 * Safely executes a function and returns its result, or handles the error
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  options?: {
    fallback?: T;
    onError?: (error: Error) => void;
  },
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error) {
    if (options?.onError) {
      options.onError(
        error instanceof Error ? error : new Error(String(error)),
      );
    } else {
      console.error('Operation failed:', error);
    }

    return options?.fallback;
  }
};

/**
 * Checks if an error matches a specific error code
 */
export const isErrorCode = (
  error: unknown,
  code: ErrorCode | string,
): boolean => {
  return error instanceof AppError && error.code === code;
};

/**
 * Formats an error for display or logging
 */
export const formatErrorForDisplay = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

/**
 * Creates a network error when API requests fail
 */
export const createNetworkError = (
  status?: number,
  message?: string,
): AppError => {
  return createError(
    message || 'Failed to connect to the server',
    ErrorCode.NETWORK_ERROR,
    { status },
  );
};

/**
 * Creates a validation error for form submissions
 */
export const createValidationError = (
  message: string,
  fieldErrors?: Record<string, string>,
): AppError => {
  return createError(message, ErrorCode.VALIDATION_ERROR, { fieldErrors });
};
