import { OAuth2Client } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import type { OAuthCredentials } from '../config/types.js';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  oauthCredentials: OAuthCredentials;
}

export class GoogleSheetsService {
  private doc: GoogleSpreadsheet | null = null;
  private auth: OAuth2Client;

  constructor(private config: GoogleSheetsConfig) {
    this.auth = new OAuth2Client(config.oauthCredentials.client_id, config.oauthCredentials.client_secret);

    this.auth.setCredentials({
      access_token: config.oauthCredentials.access_token,
      refresh_token: config.oauthCredentials.refresh_token,
      expiry_date: config.oauthCredentials.expiry_date
    });
  }

  private async ensureConnection(): Promise<void> {
    if (!this.doc) {
      this.doc = new GoogleSpreadsheet(this.config.spreadsheetId, this.auth);
      await this.doc.loadInfo();
    }
  }

  async getSheetInfo(): Promise<{
    title: string;
    sheets: Array<{ title: string; index: number; sheetId: number }>;
  }> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    return {
      title: this.doc.title,
      sheets: this.doc.sheetsByIndex.map((sheet, index) => ({
        title: sheet.title,
        index,
        sheetId: sheet.sheetId
      }))
    };
  }

  async getSheetData(sheetName: string, includeFormulas = false): Promise<string[][]> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet.loadCells();

    let lastRow = 0;
    let lastCol = 0;

    for (let row = 0; row < sheet.rowCount; row++) {
      for (let col = 0; col < sheet.columnCount; col++) {
        const cell = sheet.getCell(row, col);
        const value = includeFormulas && cell.formula ? cell.formula : (cell.formattedValue ?? '');

        if (value !== '') {
          lastRow = Math.max(lastRow, row);
          lastCol = Math.max(lastCol, col);
        }
      }
    }

    if (lastRow === 0 && lastCol === 0) {
      const firstCell = sheet.getCell(0, 0);
      const firstValue = includeFormulas && firstCell.formula ? firstCell.formula : (firstCell.formattedValue ?? '');

      if (firstValue === '') {
        return [];
      }
    }

    const data: string[][] = [];
    for (let row = 0; row <= lastRow; row++) {
      const rowData: string[] = [];
      for (let col = 0; col <= lastCol; col++) {
        const cell = sheet.getCell(row, col);
        const value = includeFormulas && cell.formula ? cell.formula : (cell.formattedValue ?? '');
        rowData.push(value);
      }
      data.push(rowData);
    }

    return data;
  }

  async addSheet(sheetName: string): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    await this.doc.addSheet({ title: sheetName });
  }

  async removeSheet(sheetName: string): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet.delete();
  }

  async renameSheet(oldName: string, newName: string): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[oldName];
    if (!sheet) {
      throw new Error(`Sheet '${oldName}' not found`);
    }

    await sheet.updateProperties({ title: newName });
  }

  async copySheet(sheetName: string, newSheetName: string): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet.duplicate({ title: newSheetName });
  }

  async writeCell(sheetName: string, cell: string, value: string): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet.loadCells(cell);
    const targetCell = sheet.getCellByA1(cell);
    targetCell.value = value;
    await sheet.saveUpdatedCells();
  }

  async writeCellRange(sheetName: string, range: string, values: string[][]): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet.loadCells(range);

    const [start, end] = range.split(':');
    const startCell = sheet.getCellByA1(start);
    const endCell = sheet.getCellByA1(end);

    let valueRowIndex = 0;
    for (let row = startCell.rowIndex; row <= endCell.rowIndex; row++) {
      let valueColIndex = 0;
      for (let col = startCell.columnIndex; col <= endCell.columnIndex; col++) {
        const cell = sheet.getCell(row, col);
        if (values[valueRowIndex] && values[valueRowIndex][valueColIndex] !== undefined) {
          const newValue = values[valueRowIndex][valueColIndex];
          const cellWithRawData = cell as unknown as { _rawData?: { dataValidation?: unknown } };
          const hasDataValidation = cellWithRawData._rawData?.dataValidation !== undefined;
          const isCellEmpty = !cell.value || cell.value === '';
          const isNewValueEmpty = newValue === '' || newValue === null;

          if (hasDataValidation && isCellEmpty && isNewValueEmpty) {
            continue;
          }

          cell.value = newValue;
        }
        valueColIndex++;
      }
      valueRowIndex++;
    }

    await sheet.saveUpdatedCells();
  }

  async appendRow(sheetName: string, values: string[]): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet.addRow(values);
  }

  async getSheetDataRange(sheetName: string, range: string, includeFormulas = false): Promise<string[][]> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet.loadCells(range);

    const [start, end] = range.split(':');
    const startCell = sheet.getCellByA1(start);
    const endCell = sheet.getCellByA1(end);

    const data: string[][] = [];
    for (let row = startCell.rowIndex; row <= endCell.rowIndex; row++) {
      const rowData: string[] = [];
      for (let col = startCell.columnIndex; col <= endCell.columnIndex; col++) {
        const cell = sheet.getCell(row, col);
        const value = includeFormulas && cell.formula ? cell.formula : (cell.formattedValue ?? '');
        rowData.push(value);
      }
      data.push(rowData);
    }

    return data;
  }

  async insertRows(
    sheetName: string,
    range: { startIndex: number; endIndex: number },
    inheritFromBefore = false
  ): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet.insertDimension('ROWS', range, inheritFromBefore);
  }

  async deleteRows(sheetName: string, range: { startIndex: number; endIndex: number }): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet._makeSingleUpdateRequest('deleteDimension', {
      range: {
        sheetId: sheet.sheetId,
        dimension: 'ROWS',
        startIndex: range.startIndex,
        endIndex: range.endIndex
      }
    });
  }

  async getRowFormulas(sheetName: string, rowIndex: number): Promise<Map<number, string>> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    await sheet.loadCells(`A${rowIndex + 1}:${rowIndex + 1}`);

    const formulas = new Map<number, string>();
    for (let col = 0; col < sheet.columnCount; col++) {
      const cell = sheet.getCell(rowIndex, col);
      if (cell.formula) {
        formulas.set(col, cell.formula);
      }
    }

    return formulas;
  }

  async copyRowFormulas(sheetName: string, sourceRowIndex: number, targetRowIndex: number): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    const formulas = await this.getRowFormulas(sheetName, sourceRowIndex);

    if (formulas.size === 0) {
      return;
    }

    await sheet.loadCells(`A${targetRowIndex + 1}:${targetRowIndex + 1}`);

    const rowDiff = targetRowIndex - sourceRowIndex;

    for (const [col, formula] of formulas) {
      const cell = sheet.getCell(targetRowIndex, col);
      const adjustedFormula = this.adjustFormulaReferences(formula, rowDiff);
      cell.formula = adjustedFormula;
    }

    await sheet.saveUpdatedCells();
  }

  async copyRowFormulasBulk(
    sheetName: string,
    sourceRowIndex: number,
    startTargetRowIndex: number,
    count: number
  ): Promise<void> {
    await this.ensureConnection();

    if (!this.doc) {
      throw new Error('Failed to connect to Google Sheets');
    }

    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    const formulas = await this.getRowFormulas(sheetName, sourceRowIndex);

    if (formulas.size === 0) {
      return;
    }

    const endTargetRowIndex = startTargetRowIndex + count - 1;
    await sheet.loadCells(`A${startTargetRowIndex + 1}:${endTargetRowIndex + 1}`);

    for (let i = 0; i < count; i++) {
      const targetRowIndex = startTargetRowIndex + i;
      const rowDiff = targetRowIndex - sourceRowIndex;

      for (const [col, formula] of formulas) {
        const cell = sheet.getCell(targetRowIndex, col);
        const adjustedFormula = this.adjustFormulaReferences(formula, rowDiff);
        cell.formula = adjustedFormula;
      }
    }

    await sheet.saveUpdatedCells();
  }

  private adjustFormulaReferences(formula: string, rowDiff: number): string {
    return formula.replace(/([A-Z]+)(\d+)/g, (_match, colLetter, rowNum) => {
      const newRow = parseInt(rowNum, 10) + rowDiff;
      return `${colLetter}${newRow}`;
    });
  }
}
