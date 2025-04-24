/**
 * Type guard to check if a value is defined (not undefined or null)
 * 
 * @param value - The value to check
 * @returns True if the value is defined, false otherwise
 */
export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};