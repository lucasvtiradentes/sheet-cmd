export function parseSpreadsheetId(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error('Spreadsheet ID or URL is required');
  }

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);

    if (match?.[1]) {
      return match[1];
    }
  } catch {}

  return trimmed;
}

export function getSpreadsheetUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}
