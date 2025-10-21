import { google } from 'googleapis';
import { OAUTH_SCOPES } from '../constants.js';
import type { OAuthCredentials } from '../types/local.js';
import { Logger } from './logger.js';

export interface DriveSpreadsheet {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

export class GoogleDriveService {
  private credentials: OAuthCredentials;

  constructor(oauthCredentials: OAuthCredentials) {
    this.credentials = oauthCredentials;
  }

  async listSpreadsheets(): Promise<DriveSpreadsheet[]> {
    const oauth2Client = new google.auth.OAuth2(
      this.credentials.client_id,
      this.credentials.client_secret
    );

    oauth2Client.setCredentials({
      access_token: this.credentials.access_token,
      refresh_token: this.credentials.refresh_token,
      expiry_date: this.credentials.expiry_date
    });

    Logger.info('Checking access token...');
    const tokenInfo = await oauth2Client.getTokenInfo(this.credentials.access_token || '');
    Logger.info(`Token scopes: ${tokenInfo.scopes?.join(', ') || 'none'}`);
    Logger.info(`Token expires at: ${this.credentials.expiry_date ? new Date(this.credentials.expiry_date).toLocaleString() : 'unknown'}`);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    Logger.info('Requesting spreadsheets from Google Drive API...');

    try {
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields: 'files(id, name, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100
      });

      const files = response.data.files || [];
      Logger.info(`Found ${files.length} spreadsheet(s)`);

      return files.map(file => ({
        id: file.id || '',
        name: file.name || 'Untitled',
        modifiedTime: file.modifiedTime || '',
        webViewLink: file.webViewLink || ''
      }));
    } catch (error: any) {
      Logger.error('Google Drive API error:', error);
      Logger.info('\nRequired scopes for this operation:');
      Logger.info(`  - ${OAUTH_SCOPES.SPREADSHEETS}`);
      Logger.info(`  - ${OAUTH_SCOPES.DRIVE_READONLY}`);
      Logger.info('\nTo fix this:');
      Logger.info('  1. Add Drive API scope in OAuth Consent Screen');
      Logger.info('  2. Run: sheet-cmd account reauth');
      throw error;
    }
  }
}
