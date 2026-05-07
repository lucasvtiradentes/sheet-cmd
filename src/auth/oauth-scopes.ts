import { OAUTH_SCOPES } from '../config/constants';

const DRIVE_SCOPES = new Set([OAUTH_SCOPES.DRIVE_READONLY, 'https://www.googleapis.com/auth/drive']);

const REQUIRED_OAUTH_SCOPES = [OAUTH_SCOPES.SPREADSHEETS, OAUTH_SCOPES.DRIVE_READONLY] as const;

function getMissingOAuthScopes(grantedScopes: string[]): string[] {
  return REQUIRED_OAUTH_SCOPES.filter((scope) => {
    if (scope === OAUTH_SCOPES.DRIVE_READONLY) {
      return !grantedScopes.some((grantedScope) => DRIVE_SCOPES.has(grantedScope));
    }

    return !grantedScopes.includes(scope);
  });
}

export function assertRequiredOAuthScopes(grantedScopes: string[]): void {
  const missingScopes = getMissingOAuthScopes(grantedScopes);

  if (missingScopes.length === 0) {
    return;
  }

  throw new Error(
    [
      'Google returned an access token without required scopes.',
      `Missing scopes: ${missingScopes.join(', ')}`,
      `Granted scopes: ${grantedScopes.length > 0 ? grantedScopes.join(', ') : 'none'}`,
      'Fix: in Google Cloud Console, add the missing scopes to the OAuth consent screen, publish/save the consent screen, then run `sheet-cmd account reauth` again.'
    ].join('\n')
  );
}
