/**
 * Convert a column number (0-based) to Excel column letter notation.
 *
 * @param colNumber - The column number (0-based: 0 = A, 1 = B, etc.)
 * @returns The Excel column letter (e.g., 'A', 'Z', 'AA', 'AB', etc.)
 *
 * @remarks
 * This function supports any number of columns, including multi-letter columns.
 * Examples:
 * - 0 → A
 * - 25 → Z
 * - 26 → AA
 * - 27 → AB
 * - 701 → ZZ
 * - 702 → AAA
 *
 * @example
 * ```typescript
 * columnNumberToLetter(0);   // 'A'
 * columnNumberToLetter(25);  // 'Z'
 * columnNumberToLetter(26);  // 'AA'
 * columnNumberToLetter(27);  // 'AB'
 * ```
 */
export function columnNumberToLetter(colNumber: number): string {
  let result = '';
  let num = colNumber;

  while (num >= 0) {
    result = String.fromCharCode((num % 26) + 65) + result;
    num = Math.floor(num / 26) - 1;
  }

  return result;
}

/**
 * Convert Excel column letter notation to a column number (0-based).
 *
 * @param colLetter - The Excel column letter (e.g., 'A', 'Z', 'AA', 'AB')
 * @returns The column number (0-based: A = 0, B = 1, etc.)
 *
 * @example
 * ```typescript
 * columnLetterToNumber('A');   // 0
 * columnLetterToNumber('Z');   // 25
 * columnLetterToNumber('AA');  // 26
 * columnLetterToNumber('AB');  // 27
 * ```
 */
export function columnLetterToNumber(colLetter: string): number {
  let result = 0;
  const letters = colLetter.toUpperCase();

  for (let i = 0; i < letters.length; i++) {
    result = result * 26 + (letters.charCodeAt(i) - 64);
  }

  return result - 1;
}

/**
 * Create an Excel range string from row and column numbers.
 *
 * @param startRow - The starting row number (1-based)
 * @param startCol - The starting column number (0-based)
 * @param endRow - The ending row number (1-based)
 * @param endCol - The ending column number (0-based)
 * @returns The Excel range string (e.g., 'A1:Z100')
 *
 * @example
 * ```typescript
 * createRange(1, 0, 10, 5);    // 'A1:F10'
 * createRange(1, 0, 100, 25);  // 'A1:Z100'
 * createRange(1, 0, 100, 26);  // 'A1:AA100'
 * ```
 */
export function createRange(startRow: number, startCol: number, endRow: number, endCol: number): string {
  const startCell = `${columnNumberToLetter(startCol)}${startRow}`;
  const endCell = `${columnNumberToLetter(endCol)}${endRow}`;
  return `${startCell}:${endCell}`;
}
