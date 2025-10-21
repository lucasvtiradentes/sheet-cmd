import './load-env';

import { beforeEach } from 'vitest';

beforeEach(() => {
  if (!process.env.SPREADSHEET_ID_E2E) {
    throw new Error('SPREADSHEET_ID_E2E is required for E2E tests. Please set it in .env.e2e file.');
  }

  if (!process.env.SERVICE_ACCOUNT_EMAIL_E2E) {
    throw new Error('SERVICE_ACCOUNT_EMAIL_E2E is required for E2E tests. Please set it in .env.e2e file.');
  }

  if (!process.env.PRIVATE_KEY_E2E) {
    throw new Error('PRIVATE_KEY_E2E is required for E2E tests. Please set it in .env.e2e file.');
  }
});

