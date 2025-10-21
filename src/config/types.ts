import { z } from 'zod';

export const oauthCredentialsSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  refresh_token: z.string(),
  access_token: z.string().optional(),
  expiry_date: z.number().optional()
});

export const spreadsheetConfigSchema = z.object({
  spreadsheet_id: z.string()
});

export const accountSchema = z.object({
  email: z.string(),
  oauth: oauthCredentialsSchema,
  activeSpreadsheet: z.string().optional(),
  spreadsheets: z.record(z.string(), spreadsheetConfigSchema)
});

export const userMetadataSchema = z.object({
  config_path: z.string(),
  activeAccount: z.string().optional(),
  accounts: z.record(z.string(), accountSchema)
});

export const sheetsConfigSchema = z.object({
  $schema: z.string().optional(),
  settings: z
    .object({
      max_results: z.number().default(50),
      default_columns: z.string().default('A:Z'),
      completion_installed: z.boolean().optional()
    })
    .optional()
});

export const sheetDataSchema = z.object({
  title: z.string(),
  index: z.number()
});

export type OAuthCredentials = z.infer<typeof oauthCredentialsSchema>;
export type SpreadsheetConfig = z.infer<typeof spreadsheetConfigSchema>;
export type Account = z.infer<typeof accountSchema>;
export type UserMetadata = z.infer<typeof userMetadataSchema>;
export type SheetsConfig = z.infer<typeof sheetsConfigSchema>;
export type SheetData = z.infer<typeof sheetDataSchema>;
