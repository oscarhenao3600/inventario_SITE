const ExcelJS = require('exceljs');

async function inspectInventarioTotal() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  const sheet = wb.getWorksheet('Inventario Total');

  console.log('--- Analizando sheet: Inventario Total ---');
  console.log(`Total rows: ${sheet.rowCount}`);

  const convenios = {};
  const devTypes = {};
  const convByDev = {};

  sheet.eachRow((row, rNum) => {
    if (rNum === 1) return;
    const item = row.getCell(1).value;
    const inst = (row.getCell(2).value || '').toString().trim();
    const sede = (row.getCell(3).value || '').toString().trim();
    const aula = (row.getCell(4).value || '').toString().trim();
    const dev = (row.getCell(5).value || '').toString().trim();
    const conv = (row.getCell(9).value || '').toString().trim();

    convenios[conv] = (convenios[conv] || 0) + 1;
    devTypes[dev] = (devTypes[dev] || 0) + 1;

    const key = `${conv} ||| ${dev}`;
    convByDev[key] = (convByDev[key] || 0) + 1;
  });

  console.log('Convenios en Inventario Total (Excel):', convenios);
  console.log('\nDispositivos en Inventario Total (Excel):', devTypes);
  console.log('\nPor Convenio y Dispositivo en Excel:');
  console.table(Object.entries(convByDev).map(([k, v]) => {
    const [c, d] = k.split(' ||| ');
    return { convenio: c, dispositivo: d, count: v };
  }));
}

inspectInventarioTotal();
