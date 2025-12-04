// Type declarations for global variables that may exist in different environments
declare const process: { env: { NODE_ENV?: string } } | undefined;

/**
 * Base error class foroverlay-kit errors
 */
export class OverlayKitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OverlayKitError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    const captureStackTrace = (
      Error as unknown as { captureStackTrace?: (target: object, constructor: Function) => void }
    ).captureStackTrace;
    if (typeof captureStackTrace === 'function') {
      captureStackTrace(this, OverlayKitError);
    }
  }
}

/**
 * Error thrown when attempting to open multiple overlays with the same ID
 */
export class DuplicateOverlayError extends OverlayKitError {
  constructor(overlayId: string) {
    super(`You can't open the multiple overlays with the same overlayId(${overlayId}). Please set a different id.`);
    this.name = 'DuplicateOverlayError';
    const captureStackTrace = (
      Error as unknown as { captureStackTrace?: (target: object, constructor: Function) => void }
    ).captureStackTrace;
    if (typeof captureStackTrace === 'function') {
      captureStackTrace(this, DuplicateOverlayError);
    }
  }
}

/**
 * Handles overlay errors based on environment
 * In development/test: throws the error
 * In production: logs to console.error and continues
 */
export function handleOverlayError(error: Error): void {
  // Check if we're in a development environment
  // In browser builds, process will be undefined and this will default to false
  const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

  if (!isProduction) {
    throw error;
  } else {
    console.error('[overlay-kit]', error.message);
  }
}
