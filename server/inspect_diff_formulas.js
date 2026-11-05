const ExcelJS = require('exceljs');

async function inspectFormulas() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  const sheet = wb.getWorksheet('Diferencias');
  for (let r = 1; r <= 10; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c);
      if (cell.formula || cell.value !== null) {
        console.log(`R${r}C${c} (${cell.address}): value=${JSON.stringify(cell.value)}, formula=${cell.formula}, result=${cell.result}`);
      }
    }
  }
}

inspectFormulas().catch(console.error);
