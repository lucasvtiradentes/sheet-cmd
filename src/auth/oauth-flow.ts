import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import { GOOGLE_API_URLS, OAUTH_CONFIG, OAUTH_SCOPES } from '../config/constants.js';
import type { OAuthCredentials } from '../config/types.js';
import { Logger } from '../utils/logger.js';

interface OAuthFlowResult {
  email: string;
  credentials: OAuthCredentials;
}

export async function performOAuthFlow(clientId: string, clientSecret: string): Promise<OAuthFlowResult> {
  const port = await getRandomAvailablePort();
  const redirectUri = `http://${OAUTH_CONFIG.REDIRECT_HOST}:${port}${OAUTH_CONFIG.REDIRECT_PATH}`;

  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: OAUTH_CONFIG.ACCESS_TYPE,
    scope: [OAUTH_SCOPES.SPREADSHEETS, OAUTH_SCOPES.DRIVE_READONLY, OAUTH_SCOPES.USERINFO_EMAIL],
    prompt: OAUTH_CONFIG.PROMPT
  });

  Logger.info(`Opening browser for authentication...`);
  Logger.info(`Visit: ${authUrl}`);

  const authCode = await startCallbackServer(port);

  const { tokens } = await oauth2Client.getToken(authCode);
  oauth2Client.setCredentials(tokens);

  const userInfo = await fetch(GOOGLE_API_URLS.USERINFO, {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  const userData = (await userInfo.json()) as { email: string };

  if (!tokens.refresh_token) {
    throw new Error('No refresh token received. Try revoking app access and re-authenticating.');
  }

  return {
    email: userData.email,
    credentials: {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token ?? undefined,
      expiry_date: tokens.expiry_date ?? undefined
    }
  };
}

async function getRandomAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0, () => {
      const address = server.address();
      if (address && typeof address !== 'string') {
        const port = address.port;
        server.close(() => resolve(port));
      } else {
        reject(new Error('Failed to get port'));
      }
    });
  });
}

async function startCallbackServer(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url?.startsWith(OAUTH_CONFIG.REDIRECT_PATH)) {
        const url = new URL(req.url, `http://${OAUTH_CONFIG.REDIRECT_HOST}:${port}`);
        const code = url.searchParams.get('code');

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding: 50px;">
                <h1 style="color: #10b981;">Authentication Successful</h1>
                <p>You can close this window and return to the terminal.</p>
              </body>
            </html>
          `);

          server.close();
          resolve(code);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding: 50px;">
                <h1 style="color: #ef4444;">✗ Authentication Failed</h1>
                <p>No authorization code received.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error('No authorization code received'));
        }
      }
    });

    server.listen(port, OAUTH_CONFIG.REDIRECT_HOST);
  });
}
