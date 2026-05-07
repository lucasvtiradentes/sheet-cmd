import { ConfigManager } from '../../../config/config-manager';
import { GoogleSheetsService } from '../../../core/google-sheets.service';

export async function getSpreadsheetTitle(
  configManager: ConfigManager,
  email: string,
  spreadsheetId: string
): Promise<string> {
  const credentials = await configManager.getRefreshedCredentials(email);
  const sheetsService = new GoogleSheetsService({
    spreadsheetId,
    oauthCredentials: credentials
  });
  const info = await sheetsService.getSheetInfo();
  return info.title;
}
