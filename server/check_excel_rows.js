const ExcelJS = require('exceljs');

async function run() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('d:\\Desarollo\\inventario_SITE\\server\\BD AULAS SITE JEFE.xlsx');
  const sheet = workbook.getWorksheet('TABLA DINAMICA');
  
  sheet.eachRow((row, rowNumber) => {
    const name = row.getCell(1).text?.trim().toUpperCase();
    if (name && (name.includes('NACIONAL JESUS MARIA OCAMPO') || name.includes('ANTONIO NARIÑO'))) {
       console.log(`Row ${rowNumber} (${name}):`, row.values.slice(1, 10));
    }
  });
}

run();
