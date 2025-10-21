/**
 * Parse CSV content into a 2D array of strings.
 *
 * @param content - The CSV content as a string
 * @returns A 2D array where each row is an array of column values
 *
 * @remarks
 * This parser handles:
 * - Quoted values with commas
 * - Escaped quotes (double quotes: "")
 * - Empty values
 * - Whitespace trimming for unquoted values
 *
 * Known limitations:
 * - Does not handle newlines within quoted fields
 * - For production use with complex CSV files, consider using a robust CSV library
 *
 * @example
 * ```typescript
 * const csv = 'name,age\n"John Doe",30\n"Jane",25';
 * const result = parseCSV(csv);
 * // [['name', 'age'], ['John Doe', '30'], ['Jane', '25']]
 * ```
 */
export function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter((line) => line.trim() !== '');
  const result: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    row.push(current.trim());
    result.push(row);
  }

  return result;
}
