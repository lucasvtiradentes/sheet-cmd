export function formatAsMarkdown(data: string[][]): string {
  if (data.length === 0) return '';

  const [headers, ...rows] = data;
  const colWidths = headers.map((_, colIndex) => Math.max(...data.map((row) => (row[colIndex] || '').length)));

  const separator = `| ${colWidths.map((w) => '-'.repeat(w)).join(' | ')} |`;
  const formatRow = (row: string[]) => `| ${row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' | ')} |`;

  return [formatRow(headers), separator, ...rows.map(formatRow)].join('\n');
}

export function formatAsCSV(data: string[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
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

export function formatAsJSON(data: string[][]): string {
  if (data.length === 0) return '[]';

  const [headers, ...rows] = data;

  const jsonData = rows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return JSON.stringify(jsonData, null, 2);
}
