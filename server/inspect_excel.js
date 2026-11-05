const ExcelJS = require('exceljs');

async function inspectExcel() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  console.log('Worksheets:', wb.worksheets.map(w => w.name));

  for (const sheet of wb.worksheets) {
    console.log(`\n--- Sheet: ${sheet.name} (RowCount: ${sheet.rowCount}, ColCount: ${sheet.columnCount}) ---`);
    for (let r = 1; r <= Math.min(sheet.rowCount, 10); r++) {
      const row = sheet.getRow(r);
      const vals = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        let v = cell.value;
        if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
        vals.push(`[col ${colNumber}]: ${JSON.stringify(v)}`);
      });
      if (vals.length > 0) {
        console.log(`Row ${r}:`, vals.slice(0, 10).join(', '));
      }
    }
  }
}

inspectExcel().catch(console.error);
