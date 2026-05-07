import { OAuth2Client } from 'google-auth-library';
import { getProgramName, TOKEN_REFRESH_THRESHOLD_MS } from '../config/constants';
import type { OAuthCredentials } from '../config/types';
import { assertRequiredOAuthScopes } from './oauth-scopes';

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
  const accessToken = newTokens.access_token || credentials.access_token;

  if (!accessToken) {
    throw new Error(`No access token available after refresh. Run \`${getProgramName()} account reauth\`.`);
  }

  const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
  assertRequiredOAuthScopes(tokenInfo.scopes);

  return {
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    refresh_token: credentials.refresh_token,
    access_token: accessToken,
    expiry_date: newTokens.expiry_date || credentials.expiry_date
  };
}
