import { Logger } from './logger.js';

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return String(error);
}

export function handleCommandError(baseMessage: string | ((error: unknown) => string)) {
  return (error: unknown) => {
    const errorDetails = formatError(error);

    if (errorDetails.includes('invalid_grant')) {
      Logger.error('OAuth token refresh failed: invalid_grant');
      Logger.info('Your refresh token is expired or invalid');
      Logger.info('Fix: sheet-cmd account reauth');
      process.exit(1);
    }

    const prefix = typeof baseMessage === 'function' ? baseMessage(error) : baseMessage;
    const fullMessage = `${prefix}: ${errorDetails}`;
    Logger.error(fullMessage);
    process.exit(1);
  };
}
