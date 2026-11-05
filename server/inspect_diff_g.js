const ExcelJS = require('exceljs');

async function inspectDiffColG() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  const sheet = wb.getWorksheet('Diferencias');
  console.log('=== Formulas in Column G of Diferencias ===');
  for (let r = 1; r <= 20; r++) {
    const cell = sheet.getRow(r).getCell(7);
    if (cell.value !== null && cell.value !== '') {
      console.log(`R${r} (${sheet.getRow(r).getCell(1).value}): formula=${cell.formula}, val=${JSON.stringify(cell.value)}, result=${cell.result}`);
    }
  }
}

inspectDiffColG();
