const ExcelJS = require('exceljs');

async function inspectCantidades() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  const sheet = wb.getWorksheet('Cantidades totales');
  console.log('--- Cantidades totales ---');
  for (let r = 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const vals = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      let v = cell.value;
      if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
      vals.push(`C${colNumber}: ${JSON.stringify(v)}`);
    });
    console.log(`R${r}:`, vals.join(' | '));
  }
}

inspectCantidades().catch(console.error);
