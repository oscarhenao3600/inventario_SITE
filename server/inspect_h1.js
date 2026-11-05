const ExcelJS = require('exceljs');

async function inspectHoja1() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE111.xlsx');
  const ws = wb.getWorksheet('Hoja1');

  const byDevConv = {};
  ws.eachRow((r, i) => {
    if (i === 1) return;
    const dev = (r.getCell(6).value || '').toString().trim();
    const conv = (r.getCell(9).value || '').toString().trim();
    const k = `${dev} ||| ${conv}`;
    byDevConv[k] = (byDevConv[k] || 0) + 1;
  });

  console.log('=== DISPOSITIVOS Y CONVENIOS EN HOJA1 (Excel 111) ===');
  console.table(Object.entries(byDevConv).map(([k, count]) => {
    const [dev, conv] = k.split(' ||| ');
    return { dev, conv, count };
  }));
}

inspectHoja1().catch(console.error);
