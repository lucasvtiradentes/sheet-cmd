import { GoogleSheetsService } from './google-sheets.service';

async function main() {
  const sheetsService = new GoogleSheetsService({
    spreadsheetId: '',
    serviceAccountEmail: '',
    privateKey: ``,
  });

  try {
    console.log('Conectando à planilha...\n');

    const info = await sheetsService.getSheetInfo();

    console.log(`📊 Planilha: ${info.title}`);
    console.log(`\n📋 Abas disponíveis (${info.sheets.length}):\n`);

    info.sheets.forEach((sheet) => {
      console.log(`  ${sheet.index + 1}. ${sheet.title}`);
    });
  } catch (error) {
    console.error('❌ Erro ao acessar a planilha:', error);
    process.exit(1);
  }
}

main();
