export function validatePositiveInteger(value: string, fieldName: string): number {
  const num = parseInt(value, 10);
  if (Number.isNaN(num) || num < 1) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return num;
}

export function validateRequired(value: string | undefined, fieldName: string): string {
  if (!value || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
  return value.trim();
}
