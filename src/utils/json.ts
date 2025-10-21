import * as fs from 'fs';

export function readJson<T = Record<string, unknown>>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON file: ${filePath}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function writeJson<T>(filePath: string, data: T, pretty = true): void {
  try {
    const jsonString = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    fs.writeFileSync(filePath, jsonString, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to write JSON file: ${filePath}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
