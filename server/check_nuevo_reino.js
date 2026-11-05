const ExcelJS = require('exceljs');

async function checkNuevoReino() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  const sheet = wb.getWorksheet('Inventario Total');

  console.log('--- NUEVO REINO in Excel ---');
  sheet.eachRow((r, i) => {
    if (i === 1) return;
    const inst = (r.getCell(2).value || '').toString().trim();
    const sede = (r.getCell(3).value || '').toString().trim();
    const aula = (r.getCell(4).value || '').toString().trim();
    const dev = (r.getCell(5).value || '').toString().trim();
    const placa = (r.getCell(6).value || '').toString().trim();
    const serial = (r.getCell(7).value || '').toString().trim();

    if (/NUEVO REINO/i.test(sede)) {
      console.log(`${inst} | ${sede} | ${aula} | ${dev} | ${placa} | ${serial}`);
    }
  });
}

checkNuevoReino();
