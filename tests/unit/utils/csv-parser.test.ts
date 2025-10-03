import { describe, expect, it } from 'vitest';

// CSV Parser function extracted from import-csv.ts and restore.ts
function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const result: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    row.push(current.trim());
    result.push(row);
  }

  return result;
}

describe('CSV Parser', () => {
  describe('Basic CSV parsing', () => {
    it('should parse simple CSV', () => {
      const csv = 'name,age,city\nJohn,30,NYC\nJane,25,LA';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['name', 'age', 'city'],
        ['John', '30', 'NYC'],
        ['Jane', '25', 'LA']
      ]);
    });

    it('should handle empty values', () => {
      const csv = 'a,b,c\n1,,3\n,2,';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['a', 'b', 'c'],
        ['1', '', '3'],
        ['', '2', '']
      ]);
    });
  });

  describe('Quoted values', () => {
    it('should handle quoted values with commas', () => {
      const csv = 'name,description\n"John Doe","Hello, World"\n"Jane","Test"';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['name', 'description'],
        ['John Doe', 'Hello, World'],
        ['Jane', 'Test']
      ]);
    });

    it('should handle escaped quotes', () => {
      const csv = 'name,quote\n"John","He said ""Hello"""';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['name', 'quote'],
        ['John', 'He said "Hello"']
      ]);
    });

    it('should handle quoted values with newlines (note: splits on \\n)', () => {
      // Note: Our simple parser splits on \n, so multi-line values become separate rows
      // This is a known limitation - for production use, consider a robust CSV library
      const csv = '"name","address"\n"John","123 Main St\nApt 4"';
      const result = parseCSV(csv);

      // Current behavior: splits on newline even inside quotes
      expect(result).toEqual([
        ['name', 'address'],
        ['John', '123 Main St'],
        ['Apt 4']
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should filter out empty lines', () => {
      const csv = 'a,b\n1,2\n\n\n3,4';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['a', 'b'],
        ['1', '2'],
        ['3', '4']
      ]);
    });

    it('should trim whitespace from unquoted values', () => {
      const csv = 'a, b , c\n 1 , 2 , 3 ';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['a', 'b', 'c'],
        ['1', '2', '3']
      ]);
    });

    it('should handle single column CSV', () => {
      const csv = 'values\n1\n2\n3';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['values'],
        ['1'],
        ['2'],
        ['3']
      ]);
    });

    it('should handle CSV with formulas', () => {
      const csv = 'formula,value\n"=SUM(A1:A10)","=A1*2"';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['formula', 'value'],
        ['=SUM(A1:A10)', '=A1*2']
      ]);
    });
  });

  describe('Real-world scenarios', () => {
    it('should parse Google Sheets exported CSV with formulas', () => {
      const csv = 'categoria,total,,"=""09/2025"""';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['categoria', 'total', '', '="09/2025"']
      ]);
    });

    it('should handle mixed quoted and unquoted values', () => {
      const csv = 'name,"age",city,"country"\nJohn,30,NYC,"USA"\n"Jane","25","LA",USA';
      const result = parseCSV(csv);

      expect(result).toEqual([
        ['name', 'age', 'city', 'country'],
        ['John', '30', 'NYC', 'USA'],
        ['Jane', '25', 'LA', 'USA']
      ]);
    });
  });
});
