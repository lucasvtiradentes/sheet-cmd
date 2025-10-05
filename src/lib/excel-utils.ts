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
