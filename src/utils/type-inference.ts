export type CellValue = string | number;

export function inferCellType(value: CellValue): CellValue {
  if (typeof value !== 'string' || value === '') return value;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || String(numericValue) !== value) return value;
  if (Number.isInteger(numericValue) && Math.abs(numericValue) > Number.MAX_SAFE_INTEGER) return value;

  return numericValue;
}

export function inferTableTypes(values: CellValue[][]): CellValue[][] {
  return values.map((row) => row.map(inferCellType));
}
