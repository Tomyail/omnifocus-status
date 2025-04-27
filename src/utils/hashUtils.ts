import crypto from 'crypto';

/**
 * Hashes a string using SHA-256.
 * 
 * @param input The string to hash.
 * @returns The SHA-256 hash as a hexadecimal string, or null if the input is not a non-empty string.
 */
export function hashString(input: any): string | null {
  if (typeof input !== 'string' || input.length === 0) {
    return null; // Return null for invalid input
  }
  try {
    return crypto.createHash('sha256').update(input).digest('hex');
  } catch (error) {
    console.error('Error during hashing:', error);
    return null; // Return null on error
  }
}
