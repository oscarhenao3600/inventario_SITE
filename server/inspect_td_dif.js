const ExcelJS = require('exceljs');

async function inspectSheets() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');

  const wsDif = wb.getWorksheet('Diferencias');
  console.log('=== Diferencias Header & First 20 Rows ===');
  for (let r = 1; r <= Math.min(25, wsDif.rowCount); r++) {
    const row = wsDif.getRow(r);
    const vals = [];
    row.eachCell({ includeEmpty: true }, (c, i) => vals.push(`C${i}: ${JSON.stringify(c.value)}`));
    console.log(`R${r}:`, vals.join(' | '));
  }

  const wsTD = wb.getWorksheet('TABLA DINAMICA');
  console.log('\n=== TABLA DINAMICA Header & First 20 Rows ===');
  for (let r = 1; r <= Math.min(25, wsTD.rowCount); r++) {
    const row = wsTD.getRow(r);
    const vals = [];
    row.eachCell({ includeEmpty: true }, (c, i) => vals.push(`C${i}: ${JSON.stringify(c.value)}`));
    console.log(`R${r}:`, vals.join(' | '));
  }
}

inspectSheets().catch(console.error);
