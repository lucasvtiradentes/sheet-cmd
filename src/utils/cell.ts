export function columnLetterToNumber(colLetter: string): number {
  let result = 0;
  const letters = colLetter.toUpperCase();

  for (let i = 0; i < letters.length; i++) {
    result = result * 26 + (letters.charCodeAt(i) - 64);
  }

  return result - 1;
}
