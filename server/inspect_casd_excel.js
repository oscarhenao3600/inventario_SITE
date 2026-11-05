const ExcelJS = require('exceljs');

async function inspectCasdExcel() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE111.xlsx');
  const ws = wb.getWorksheet('INVENTARIO');

  const casdRows = [];
  ws.eachRow((r, i) => {
    if (i === 1) return;
    const inst = (r.getCell(3).value || '').toString().trim();
    const dev = (r.getCell(6).value || '').toString().trim();
    if (inst.includes('CASD') && dev.includes('Carro')) {
      casdRows.push({
        row: i,
        inst,
        sede: r.getCell(4).value,
        aula: r.getCell(5).value,
        placa: r.getCell(1).value,
        serial: r.getCell(8).value,
        modelo: r.getCell(7).value,
        conv: r.getCell(9).value
      });
    }
  });

  console.log(`Carros de CASD en INVENTARIO (Excel 111): ${casdRows.length}`);
  console.table(casdRows.slice(0, 15));

  // Also check sheet Hoja1 in Excel 111 for CASD
  const wsH1 = wb.getWorksheet('Hoja1');
  const h1Casd = [];
  wsH1.eachRow((r, i) => {
    if (i === 1) return;
    const inst = (r.getCell(3).value || '').toString().trim();
    const dev = (r.getCell(6).value || '').toString().trim();
    if (inst.includes('CASD') && dev.includes('Carro')) {
      h1Casd.push({
        placa: r.getCell(1).value,
        sede: r.getCell(4).value,
        aula: r.getCell(5).value,
        conv: r.getCell(9).value
      });
    }
  });
  console.log(`Carros de CASD en Hoja1 (Excel 111): ${h1Casd.length}`);
  console.table(h1Casd.slice(0, 15));
}

inspectCasdExcel().catch(console.error);
