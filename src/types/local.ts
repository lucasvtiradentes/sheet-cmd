import { z } from 'zod';

// User metadata file structure
export const userMetadataSchema = z.object({
  config_path: z.string(),
  active_spreadsheet: z.string().optional()
});

// Spreadsheet credentials schema
export const spreadsheetCredentialsSchema = z.object({
  name: z.string(),
  spreadsheet_id: z.string(),
  service_account_email: z.string(),
  private_key: z.string()
});

// Sheets CLI configuration schema
export const sheetsConfigSchema = z.object({
  $schema: z.string().optional(),
  spreadsheets: z.record(z.string(), spreadsheetCredentialsSchema),
  settings: z
    .object({
      max_results: z.number().default(50),
      default_columns: z.string().default('A:Z'),
      completion_installed: z.boolean().optional()
    })
    .optional()
});

// Sheet data structure
export const sheetDataSchema = z.object({
  title: z.string(),
  index: z.number()
});

// Export types using z.infer
export type UserMetadata = z.infer<typeof userMetadataSchema>;
export type SpreadsheetCredentials = z.infer<typeof spreadsheetCredentialsSchema>;
export type SheetsConfig = z.infer<typeof sheetsConfigSchema>;
export type SheetData = z.infer<typeof sheetDataSchema>;
