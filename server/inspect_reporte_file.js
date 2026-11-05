const ExcelJS = require('exceljs');

async function inspectReporte() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx');
  console.log('Worksheets in Reporte:', wb.worksheets.map(w => w.name));
  for (const ws of wb.worksheets) {
    console.log(`\n--- Sheet ${ws.name} (rows: ${ws.rowCount}) ---`);
    for (let r = 1; r <= Math.min(10, ws.rowCount); r++) {
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

inspectReporte().catch(console.error);
