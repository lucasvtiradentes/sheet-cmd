import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { OAuth2Client } from 'google-auth-library';
import { OAUTH_SCOPES } from '../src/config/constants';

const spreadsheetId = getArgValue('--spreadsheet-id') ?? process.env.SPREADSHEET_ID_E2E;

if (!spreadsheetId) {
  throw new Error('Missing --spreadsheet-id or SPREADSHEET_ID_E2E');
}

const adcPath = path.join(os.homedir(), '.config', 'gcloud', 'application_default_credentials.json');
const credentials = JSON.parse(fs.readFileSync(adcPath, 'utf8'));

if (credentials.type !== 'authorized_user') {
  throw new Error(`Expected authorized_user ADC credentials, got '${credentials.type}'`);
}

const oauth2Client = new OAuth2Client(credentials.client_id, credentials.client_secret);
oauth2Client.setCredentials({ refresh_token: credentials.refresh_token });

const { credentials: refreshedCredentials } = await oauth2Client.refreshAccessToken();
const accessToken = refreshedCredentials.access_token;

if (!accessToken) {
  throw new Error('No access token available from ADC refresh token');
}

const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
const grantedScopes = new Set(tokenInfo.scopes);
const requiredScopes = [OAUTH_SCOPES.SPREADSHEETS, OAUTH_SCOPES.DRIVE_READONLY, OAUTH_SCOPES.USERINFO_EMAIL];
const missingScopes = requiredScopes.filter((scope) => !grantedScopes.has(scope));

if (missingScopes.length > 0) {
  throw new Error(`ADC credentials are missing scopes: ${missingScopes.join(', ')}`);
}

if (!tokenInfo.email) {
  throw new Error('No email returned for ADC access token');
}

const env = [
  `SPREADSHEET_ID_E2E=${spreadsheetId}`,
  `ACCOUNT_EMAIL_E2E=${tokenInfo.email}`,
  `OAUTH_CLIENT_ID_E2E=${credentials.client_id}`,
  `OAUTH_CLIENT_SECRET_E2E=${credentials.client_secret}`,
  `OAUTH_REFRESH_TOKEN_E2E=${credentials.refresh_token}`,
  ''
].join('\n');

fs.writeFileSync('.env.e2e', env, { mode: 0o600 });
console.log(`Wrote .env.e2e for ${tokenInfo.email}`);

function getArgValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}
