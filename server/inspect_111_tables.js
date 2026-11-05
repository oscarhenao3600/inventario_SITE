const ExcelJS = require('exceljs');

async function inspect111() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE111.xlsx');

  for (const sheetName of ['TABLA DINAMICA', 'TABLA 2', 'Diferencias', 'Hoja1']) {
    const ws = wb.getWorksheet(sheetName);
    console.log(`\n=================== SHEET: ${sheetName} ===================`);
    for (let r = 1; r <= Math.min(15, ws.rowCount); r++) {
      const row = ws.getRow(r);
      const vals = [];
      row.eachCell({ includeEmpty: true }, (c, i) => {
        let v = c.value;
        if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
        vals.push(`C${i}: ${JSON.stringify(v)}`);
      });
      console.log(`R${r}:`, vals.join(' | '));
    }
  }
}

inspect111().catch(console.error);
