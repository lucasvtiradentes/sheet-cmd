/**
 * Format data as a Markdown table.
 *
 * @param data - 2D array where first row is treated as headers
 * @returns Formatted Markdown table string
 *
 * @example
 * ```typescript
 * const data = [['Name', 'Age'], ['John', '30'], ['Jane', '25']];
 * const markdown = formatAsMarkdown(data);
 * // | Name | Age |
 * // | ---- | --- |
 * // | John | 30  |
 * // | Jane | 25  |
 * ```
 */
export function formatAsMarkdown(data: string[][]): string {
  if (data.length === 0) return '';

  const [headers, ...rows] = data;
  const colWidths = headers.map((_, colIndex) =>
    Math.max(...data.map(row => (row[colIndex] || '').length))
  );

  const separator = '| ' + colWidths.map(w => '-'.repeat(w)).join(' | ') + ' |';
  const formatRow = (row: string[]) =>
    '| ' + row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' | ') + ' |';

  return [formatRow(headers), separator, ...rows.map(formatRow)].join('\n');
}

/**
 * Format data as CSV (Comma-Separated Values).
 *
 * @param data - 2D array of values
 * @returns CSV formatted string
 *
 * @remarks
 * Properly handles:
 * - Values containing commas (wrapped in quotes)
 * - Values containing quotes (escaped as double quotes)
 * - Values containing newlines (wrapped in quotes)
 *
 * @example
 * ```typescript
 * const data = [['Name', 'City'], ['John Doe', 'NYC'], ['Jane', 'LA']];
 * const csv = formatAsCSV(data);
 * // Name,City
 * // John Doe,NYC
 * // Jane,LA
 * ```
 */
export function formatAsCSV(data: string[][]): string {
  return data
    .map(row =>
      row
        .map(cell => {
          const value = cell || '';
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Format data as JSON array of objects.
 *
 * @param data - 2D array where first row is treated as headers
 * @returns JSON formatted string (pretty-printed with 2 spaces)
 *
 * @example
 * ```typescript
 * const data = [['Name', 'Age'], ['John', '30'], ['Jane', '25']];
 * const json = formatAsJSON(data);
 * // [
 * //   { "Name": "John", "Age": "30" },
 * //   { "Name": "Jane", "Age": "25" }
 * // ]
 * ```
 */
export function formatAsJSON(data: string[][]): string {
  if (data.length === 0) return '[]';

  const [headers, ...rows] = data;

  const jsonData = rows.map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return JSON.stringify(jsonData, null, 2);
}
