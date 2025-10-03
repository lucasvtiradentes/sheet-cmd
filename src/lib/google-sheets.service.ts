import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
}

export class GoogleSheetsService {
  private doc: GoogleSpreadsheet | null = null;
  private auth: JWT;

  constructor(private config: GoogleSheetsConfig) {
    this.auth = new JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  private async ensureConnection(): Promise<void> {
    if (!this.doc) {
      this.doc = new GoogleSpreadsheet(this.config.spreadsheetId, this.auth);
      await this.doc.loadInfo();
    }
  }

  async getSheetInfo(): Promise<{
    title: string;
    sheets: Array<{ title: string; index: number }>;
  }> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    return {
      title: this.doc.title,
      sheets: this.doc.sheetsByIndex.map((sheet, index) => ({
        title: sheet.title,
        index,
      })),
    };
  }
}
