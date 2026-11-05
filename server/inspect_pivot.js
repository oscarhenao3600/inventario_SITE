const ExcelJS = require('exceljs');

async function inspectPivot() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  const sheet = wb.getWorksheet('TABLA DINAMICA');
  console.log('=== BD AULAS SITE JEFE.xlsx -> TABLA DINAMICA ===');
  for (let r = 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const vals = [];
    for (let c = 1; c <= 10; c++) {
      let v = row.getCell(c).value;
      if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
      vals.push(v === null || v === undefined ? '' : v);
    }
    console.log(`R${r}: ` + vals.join(' | '));
  }
}

inspectPivot();
