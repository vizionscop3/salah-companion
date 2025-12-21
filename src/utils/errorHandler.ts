/**
 * Error Handler Utility
 *
 * Centralized error handling and user-friendly error messages.
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Error codes
 */
export enum ErrorCode {
  // Location errors
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  LOCATION_UNAVAILABLE = 'LOCATION_UNAVAILABLE',
  LOCATION_TIMEOUT = 'LOCATION_TIMEOUT',

  // Prayer time errors
  PRAYER_TIME_CALCULATION_FAILED = 'PRAYER_TIME_CALCULATION_FAILED',
  INVALID_LOCATION = 'INVALID_LOCATION',

  // Audio errors
  AUDIO_LOAD_FAILED = 'AUDIO_LOAD_FAILED',
  AUDIO_PLAY_FAILED = 'AUDIO_PLAY_FAILED',
  AUDIO_FILE_NOT_FOUND = 'AUDIO_FILE_NOT_FOUND',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',

  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',

  // Authentication errors
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Error messages mapping
 */
const ERROR_MESSAGES: Record<ErrorCode, {userMessage: string; severity: AppError['severity']}> = {
  [ErrorCode.LOCATION_PERMISSION_DENIED]: {
    userMessage: 'Location permission is required to calculate accurate prayer times. Please enable it in settings.',
    severity: 'warning',
  },
  [ErrorCode.LOCATION_UNAVAILABLE]: {
    userMessage: 'Unable to get your location. Please check your GPS settings.',
    severity: 'error',
  },
  [ErrorCode.LOCATION_TIMEOUT]: {
    userMessage: 'Location request timed out. Please try again.',
    severity: 'warning',
  },
  [ErrorCode.PRAYER_TIME_CALCULATION_FAILED]: {
    userMessage: 'Failed to calculate prayer times. Please try again later.',
    severity: 'error',
  },
  [ErrorCode.INVALID_LOCATION]: {
    userMessage: 'Invalid location. Please check your location settings.',
    severity: 'error',
  },
  [ErrorCode.AUDIO_LOAD_FAILED]: {
    userMessage: 'Failed to load audio. Please check your internet connection.',
    severity: 'error',
  },
  [ErrorCode.AUDIO_PLAY_FAILED]: {
    userMessage: 'Failed to play audio. Please try again.',
    severity: 'warning',
  },
  [ErrorCode.AUDIO_FILE_NOT_FOUND]: {
    userMessage: 'Audio file not found. Please contact support.',
    severity: 'error',
  },
  [ErrorCode.NETWORK_ERROR]: {
    userMessage: 'Network error. Please check your internet connection.',
    severity: 'error',
  },
  [ErrorCode.NETWORK_TIMEOUT]: {
    userMessage: 'Request timed out. Please try again.',
    severity: 'warning',
  },
  [ErrorCode.DATABASE_ERROR]: {
    userMessage: 'Database error occurred. Please try again.',
    severity: 'error',
  },
  [ErrorCode.DATABASE_CONNECTION_FAILED]: {
    userMessage: 'Unable to connect to database. Please check your connection.',
    severity: 'error',
  },
  [ErrorCode.AUTH_FAILED]: {
    userMessage: 'Authentication failed. Please check your credentials.',
    severity: 'error',
  },
  [ErrorCode.AUTH_TOKEN_EXPIRED]: {
    userMessage: 'Your session has expired. Please log in again.',
    severity: 'warning',
  },
  [ErrorCode.USER_NOT_FOUND]: {
    userMessage: 'User not found. Please check your account.',
    severity: 'error',
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    userMessage: 'An unexpected error occurred. Please try again.',
    severity: 'error',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    userMessage: 'Invalid input. Please check your information.',
    severity: 'warning',
  },
};

/**
 * Create a user-friendly error object
 */
export function createAppError(
  code: ErrorCode,
  originalMessage?: string,
): AppError {
  const errorInfo = ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];

  return {
    code,
    message: originalMessage || errorInfo.userMessage,
    userMessage: errorInfo.userMessage,
    severity: errorInfo.severity,
  };
}

/**
 * Handle error and return user-friendly message
 */
export function handleError(error: unknown): AppError {
  if (error instanceof Error) {
    // Try to match error message to known error codes
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('permission')) {
      return createAppError(ErrorCode.LOCATION_PERMISSION_DENIED, error.message);
    }
    if (errorMessage.includes('location')) {
      return createAppError(ErrorCode.LOCATION_UNAVAILABLE, error.message);
    }
    if (errorMessage.includes('timeout')) {
      return createAppError(ErrorCode.NETWORK_TIMEOUT, error.message);
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return createAppError(ErrorCode.NETWORK_ERROR, error.message);
    }
    if (errorMessage.includes('audio') || errorMessage.includes('sound')) {
      return createAppError(ErrorCode.AUDIO_PLAY_FAILED, error.message);
    }
    if (errorMessage.includes('auth') || errorMessage.includes('login')) {
      return createAppError(ErrorCode.AUTH_FAILED, error.message);
    }
    if (errorMessage.includes('database') || errorMessage.includes('prisma')) {
      return createAppError(ErrorCode.DATABASE_ERROR, error.message);
    }

    return createAppError(ErrorCode.UNKNOWN_ERROR, error.message);
  }

  return createAppError(ErrorCode.UNKNOWN_ERROR);
}

/**
 * Log error for debugging
 */
export function logError(error: AppError, context?: string) {
  console.error(`[${error.code}]${context ? ` [${context}]` : ''}:`, {
    message: error.message,
    userMessage: error.userMessage,
    severity: error.severity,
  });
}

