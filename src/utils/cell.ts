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
