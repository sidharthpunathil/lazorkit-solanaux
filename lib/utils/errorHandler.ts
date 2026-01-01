/**
 * Error Handling Utilities
 * 
 * Standardized error handling patterns following Lazorkit's approach.
 * Provides consistent error handling across the application.
 */

/**
 * Converts unknown error to Error instance
 */
export const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  return new Error(String(error));
};

/**
 * Standardized error handler for async operations
 * Logs error and returns Error instance
 */
export const handleError = (
  error: unknown,
  context: string
): Error => {
  const err = toError(error);
  console.error(`[${context}]`, err);
  return err;
};

/**
 * Error handler with callback support
 * Similar to Lazorkit's handleActionError pattern
 */
export const handleActionError = (
  error: unknown,
  onFail?: (error: Error) => void
): never => {
  const err = toError(error);
  onFail?.(err);
  throw err;
};

