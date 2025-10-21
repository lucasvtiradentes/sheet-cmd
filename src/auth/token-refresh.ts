import { OAuth2Client } from 'google-auth-library';
import { TOKEN_REFRESH_THRESHOLD_MS } from '../config/constants.js';
import type { OAuthCredentials } from '../config/types.js';

export async function refreshTokenIfNeeded(credentials: OAuthCredentials): Promise<OAuthCredentials> {
  const now = Date.now();
  const expiryDate = credentials.expiry_date || 0;

  if (now >= expiryDate - TOKEN_REFRESH_THRESHOLD_MS) {
    return await refreshToken(credentials);
  }

  return credentials;
}

export async function refreshToken(credentials: OAuthCredentials): Promise<OAuthCredentials> {
  const oauth2Client = new OAuth2Client(credentials.client_id, credentials.client_secret);

  oauth2Client.setCredentials({
    refresh_token: credentials.refresh_token
  });

  const { credentials: newTokens } = await oauth2Client.refreshAccessToken();

  return {
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    refresh_token: credentials.refresh_token,
    access_token: newTokens.access_token || credentials.access_token,
    expiry_date: newTokens.expiry_date || credentials.expiry_date
  };
}
