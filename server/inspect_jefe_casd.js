const ExcelJS = require('exceljs');

async function inspectJefeExcel() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  const ws = wb.getWorksheet('Inventario Total');

  const casdRows = [];
  ws.eachRow((r, i) => {
    if (i === 1) return;
    const inst = (r.getCell(2).value || '').toString().trim();
    const dev = (r.getCell(5).value || '').toString().trim();
    if (inst.includes('CASD') && dev.includes('Carro')) {
      casdRows.push({
        row: i,
        inst,
        sede: r.getCell(3).value,
        aula: r.getCell(4).value,
        placa: r.getCell(1).value,
        serial: r.getCell(8).value,
        modelo: r.getCell(7).value,
        conv: r.getCell(9).value
      });
    }
  });

  console.log(`Carros de CASD en Inventario Total: ${casdRows.length}`);
  console.table(casdRows.slice(0, 15));
}

inspectJefeExcel().catch(console.error);
