export function columnLetterToNumber(colLetter: string): number {
  let result = 0;
  const letters = colLetter.toUpperCase();

  for (let i = 0; i < letters.length; i++) {
    result = result * 26 + (letters.charCodeAt(i) - 64);
  }

  return result - 1;
}

export function numberToColumnLetter(columnIndex: number): string {
  let columnNumber = columnIndex + 1;
  let result = '';

  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }

  return result;
}

export function parseCellAddress(cell: string): { columnIndex: number; rowIndex: number } | null {
  const match = cell.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;

  return {
    columnIndex: columnLetterToNumber(match[1]),
    rowIndex: parseInt(match[2], 10) - 1
  };
}

export function rangeFromStartCell(startCell: string, rowCount: number, columnCount: number): string | null {
  const parsed = parseCellAddress(startCell);
  if (!parsed || rowCount < 1 || columnCount < 1) return null;

  const endColumn = numberToColumnLetter(parsed.columnIndex + columnCount - 1);
  const endRow = parsed.rowIndex + rowCount;

  return `${startCell}:${endColumn}${endRow}`;
}
