const ExcelJS = require('exceljs');

async function inspectFullDiferencias() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  const sheet = wb.getWorksheet('Diferencias');
  console.log('=== BD AULAS SITE JEFE.xlsx -> FULL Diferencias ===');
  for (let r = 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const vals = [];
    for (let c = 1; c <= 7; c++) {
      let v = row.getCell(c).value;
      if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
      vals.push(v === null || v === undefined ? '' : v);
    }
    // Only print if not completely empty
    if (vals.some(x => x !== '')) {
      console.log(`R${r}: ` + vals.join(' | '));
    }
  }
}

inspectFullDiferencias();
