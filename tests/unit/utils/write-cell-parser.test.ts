import { describe, expect, it } from 'vitest';

// Parser function extracted from write-cell.ts
function parseWriteCellValues(value: string): string[][] {
  // Parse value: semicolon separates rows, comma separates columns
  // Example: "val1, val2; val3, val4" -> [["val1", "val2"], ["val3", "val4"]]
  const rows = value.split(';').map(row => row.trim());
  const values = rows.map(row =>
    row.split(',').map(cell => cell.trim())
  );
  return values;
}

describe('Write Cell Value Parser', () => {
  describe('Basic parsing', () => {
    it('should parse single row with multiple columns', () => {
      const result = parseWriteCellValues('val1, val2, val3');

      expect(result).toEqual([['val1', 'val2', 'val3']]);
    });

    it('should parse multiple rows with multiple columns', () => {
      const result = parseWriteCellValues('val1, val2; val3, val4');

      expect(result).toEqual([
        ['val1', 'val2'],
        ['val3', 'val4']
      ]);
    });

    it('should parse single cell', () => {
      const result = parseWriteCellValues('single value');

      expect(result).toEqual([['single value']]);
    });
  });

  describe('Whitespace handling', () => {
    it('should trim whitespace from cells', () => {
      const result = parseWriteCellValues('  val1  ,  val2  ;  val3  ,  val4  ');

      expect(result).toEqual([
        ['val1', 'val2'],
        ['val3', 'val4']
      ]);
    });

    it('should trim whitespace from rows', () => {
      const result = parseWriteCellValues(' a, b ; c, d ');

      expect(result).toEqual([
        ['a', 'b'],
        ['c', 'd']
      ]);
    });
  });

  describe('Real-world use cases', () => {
    it('should parse headers and data', () => {
      const result = parseWriteCellValues('Name, Age, City; John, 30, NYC; Jane, 25, LA');

      expect(result).toEqual([
        ['Name', 'Age', 'City'],
        ['John', '30', 'NYC'],
        ['Jane', '25', 'LA']
      ]);
    });

    it('should parse formulas', () => {
      const result = parseWriteCellValues('=SUM(A1:A10), =AVERAGE(B1:B10); 100, 50');

      expect(result).toEqual([
        ['=SUM(A1:A10)', '=AVERAGE(B1:B10)'],
        ['100', '50']
      ]);
    });

    it('should handle numeric values', () => {
      const result = parseWriteCellValues('1, 2, 3; 4, 5, 6');

      expect(result).toEqual([
        ['1', '2', '3'],
        ['4', '5', '6']
      ]);
    });

    it('should handle currency values (USD format)', () => {
      // Note: Brazilian format (R$ 100,00) uses comma as decimal separator
      // This conflicts with our comma-as-column-separator design
      // Use USD format (100.00) or escape commas when needed
      const result = parseWriteCellValues('R$ 100.00, USD 50.00; R$ 200.00, USD 100.00');

      expect(result).toEqual([
        ['R$ 100.00', 'USD 50.00'],
        ['R$ 200.00', 'USD 100.00']
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty values between separators', () => {
      const result = parseWriteCellValues('a, , c; , b, ');

      expect(result).toEqual([
        ['a', '', 'c'],
        ['', 'b', '']
      ]);
    });

    it('should handle rows with different column counts', () => {
      const result = parseWriteCellValues('a, b, c; x, y');

      expect(result).toEqual([
        ['a', 'b', 'c'],
        ['x', 'y']
      ]);
    });

    it('should handle single semicolon (two rows, one empty)', () => {
      const result = parseWriteCellValues('a, b;');

      expect(result).toEqual([
        ['a', 'b'],
        ['']
      ]);
    });

    it('should handle single comma (one row, two cells)', () => {
      const result = parseWriteCellValues('a,');

      expect(result).toEqual([['a', '']]);
    });
  });

  describe('Range validation', () => {
    it('should create 2x2 matrix for A1:B2 range', () => {
      const result = parseWriteCellValues('val1, val2; val3, val4');

      expect(result).toHaveLength(2); // 2 rows
      expect(result[0]).toHaveLength(2); // 2 columns
      expect(result[1]).toHaveLength(2); // 2 columns
    });

    it('should create 1x3 matrix for A1:C1 range', () => {
      const result = parseWriteCellValues('val1, val2, val3');

      expect(result).toHaveLength(1); // 1 row
      expect(result[0]).toHaveLength(3); // 3 columns
    });

    it('should create 3x1 matrix for A1:A3 range', () => {
      const result = parseWriteCellValues('val1; val2; val3');

      expect(result).toHaveLength(3); // 3 rows
      expect(result[0]).toHaveLength(1); // 1 column
      expect(result[1]).toHaveLength(1); // 1 column
      expect(result[2]).toHaveLength(1); // 1 column
    });
  });

  describe('Special characters', () => {
    it('should handle values with parentheses', () => {
      const result = parseWriteCellValues('=(A1+B1), =(C1*D1)');

      expect(result).toEqual([['=(A1+B1)', '=(C1*D1)']]);
    });

    it('should handle values with quotes', () => {
      const result = parseWriteCellValues('"Hello", "World"');

      expect(result).toEqual([['"Hello"', '"World"']]);
    });

    it('should handle values with special chars', () => {
      const result = parseWriteCellValues('100%, $50.00, #TAG');

      expect(result).toEqual([['100%', '$50.00', '#TAG']]);
    });
  });
});
