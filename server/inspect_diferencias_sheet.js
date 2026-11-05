const ExcelJS = require('exceljs');

async function inspectDiferencias() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  const sheet = wb.getWorksheet('Diferencias');
  console.log('--- Diferencias --- (rows: ' + sheet.rowCount + ')');
  for (let r = 1; r <= Math.min(sheet.rowCount, 25); r++) {
    const row = sheet.getRow(r);
    const vals = [];
    for (let c = 1; c <= 8; c++) {
      let v = row.getCell(c).value;
      if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
      vals.push(v === null || v === undefined ? '' : v);
    }
    console.log(`R${r}: ` + vals.join(' | '));
  }
}

inspectDiferencias().catch(console.error);
