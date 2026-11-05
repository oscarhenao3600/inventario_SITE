const ExcelJS = require('exceljs');

async function inspect111() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE111.xlsx');
  
  for (const sname of ['TABLA 2', 'Diferencias', 'TABLA DINAMICA']) {
    const ws = wb.getWorksheet(sname);
    console.log(`\n--- Sheet ${sname} in BD AULAS SITE JEFE111.xlsx ---`);
    for (let r = 1; r <= Math.min(ws.rowCount, 8); r++) {
      const row = ws.getRow(r);
      const vals = [];
      row.eachCell({ includeEmpty: true }, (c, colNum) => {
        let v = c.value;
        if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
        vals.push(`C${colNum}:${JSON.stringify(v)}`);
      });
      console.log(`R${r}: ` + vals.slice(0, 10).join(' | '));
    }
  }
}

inspect111();
