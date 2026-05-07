import './e2e-load-env';

import { beforeEach } from 'vitest';

beforeEach(() => {
  if (!process.env.SPREADSHEET_ID_E2E) {
    throw new Error('SPREADSHEET_ID_E2E is required for E2E tests. Please set it in .env.e2e file.');
  }

  if (!process.env.ACCOUNT_EMAIL_E2E) {
    throw new Error('ACCOUNT_EMAIL_E2E is required for E2E tests. Please set it in .env.e2e file.');
  }

  if (!process.env.OAUTH_CLIENT_ID_E2E) {
    throw new Error('OAUTH_CLIENT_ID_E2E is required for E2E tests. Please set it in .env.e2e file.');
  }

  if (!process.env.OAUTH_CLIENT_SECRET_E2E) {
    throw new Error('OAUTH_CLIENT_SECRET_E2E is required for E2E tests. Please set it in .env.e2e file.');
  }

  if (!process.env.OAUTH_REFRESH_TOKEN_E2E) {
    throw new Error('OAUTH_REFRESH_TOKEN_E2E is required for E2E tests. Please set it in .env.e2e file.');
  }
});
