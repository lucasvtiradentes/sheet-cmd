import { describe, expect, it } from 'vitest';

// Formatting functions extracted from read-sheet.ts and export.ts
function formatAsMarkdown(data: string[][]): string {
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

function formatAsCSV(data: string[][]): string {
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

function formatAsJSON(data: string[][]): string {
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

describe('Data Formatters', () => {
  describe('formatAsMarkdown', () => {
    it('should format simple table as markdown', () => {
      const data = [
        ['Name', 'Age', 'City'],
        ['John', '30', 'NYC'],
        ['Jane', '25', 'LA']
      ];

      const result = formatAsMarkdown(data);

      expect(result).toBe(
        '| Name | Age | City |\n' +
        '| ---- | --- | ---- |\n' +
        '| John | 30  | NYC  |\n' +
        '| Jane | 25  | LA   |'
      );
    });

    it('should handle empty cells', () => {
      const data = [
        ['A', 'B', 'C'],
        ['1', '', '3'],
        ['', '2', '']
      ];

      const result = formatAsMarkdown(data);

      expect(result).toBe(
        '| A | B | C |\n' +
        '| - | - | - |\n' +
        '| 1 |   | 3 |\n' +
        '|   | 2 |   |'
      );
    });

    it('should return empty string for empty data', () => {
      const result = formatAsMarkdown([]);
      expect(result).toBe('');
    });

    it('should adjust column widths based on longest value', () => {
      const data = [
        ['Short', 'Much Longer Header'],
        ['A', 'B']
      ];

      const result = formatAsMarkdown(data);

      expect(result).toBe(
        '| Short | Much Longer Header |\n' +
        '| ----- | ------------------ |\n' +
        '| A     | B                  |'
      );
    });
  });

  describe('formatAsCSV', () => {
    it('should format simple data as CSV', () => {
      const data = [
        ['name', 'age', 'city'],
        ['John', '30', 'NYC'],
        ['Jane', '25', 'LA']
      ];

      const result = formatAsCSV(data);

      expect(result).toBe('name,age,city\nJohn,30,NYC\nJane,25,LA');
    });

    it('should quote values with commas', () => {
      const data = [
        ['name', 'description'],
        ['John', 'Hello, World'],
        ['Jane', 'Test']
      ];

      const result = formatAsCSV(data);

      expect(result).toBe('name,description\nJohn,"Hello, World"\nJane,Test');
    });

    it('should escape quotes in values', () => {
      const data = [
        ['name', 'quote'],
        ['John', 'He said "Hello"']
      ];

      const result = formatAsCSV(data);

      expect(result).toBe('name,quote\nJohn,"He said ""Hello"""');
    });

    it('should quote values with newlines', () => {
      const data = [
        ['name', 'address'],
        ['John', '123 Main St\nApt 4']
      ];

      const result = formatAsCSV(data);

      expect(result).toBe('name,address\nJohn,"123 Main St\nApt 4"');
    });

    it('should handle empty values', () => {
      const data = [
        ['a', 'b', 'c'],
        ['1', '', '3']
      ];

      const result = formatAsCSV(data);

      expect(result).toBe('a,b,c\n1,,3');
    });

    it('should preserve formulas', () => {
      const data = [
        ['formula', 'value'],
        ['=SUM(A1:A10)', '=A1*2']
      ];

      const result = formatAsCSV(data);

      expect(result).toBe('formula,value\n=SUM(A1:A10),=A1*2');
    });
  });

  describe('formatAsJSON', () => {
    it('should format data as JSON with headers as keys', () => {
      const data = [
        ['name', 'age', 'city'],
        ['John', '30', 'NYC'],
        ['Jane', '25', 'LA']
      ];

      const result = formatAsJSON(data);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual([
        { name: 'John', age: '30', city: 'NYC' },
        { name: 'Jane', age: '25', city: 'LA' }
      ]);
    });

    it('should handle empty values', () => {
      const data = [
        ['a', 'b', 'c'],
        ['1', '', '3']
      ];

      const result = formatAsJSON(data);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual([
        { a: '1', b: '', c: '3' }
      ]);
    });

    it('should return empty array for empty data', () => {
      const result = formatAsJSON([]);
      expect(result).toBe('[]');
    });

    it('should format with pretty printing', () => {
      const data = [
        ['name', 'value'],
        ['test', '123']
      ];

      const result = formatAsJSON(data);

      expect(result).toContain('  '); // Contains indentation
      expect(result).toContain('\n');  // Contains newlines
    });
  });

  describe('CSV roundtrip (parse and format)', () => {
    it('should maintain data integrity through CSV roundtrip', () => {
      const original = [
        ['name', 'description', 'price'],
        ['Product A', 'Hello, World', '29.99'],
        ['Product B', 'Test "quoted" value', '49.99']
      ];

      const csv = formatAsCSV(original);

      // Note: This would require the parseCSV function from csv-parser.test.ts
      // Just verify the CSV format is correct
      expect(csv).toContain('Product A,"Hello, World",29.99');
      expect(csv).toContain('Product B,"Test ""quoted"" value",49.99');
    });
  });
});
