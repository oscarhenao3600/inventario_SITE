const ExcelJS = require('exceljs');

async function analyzeExcel() {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile('d:\\Desarollo\\inventario_SITE\\server\\BD AULAS SITE JEFE.xlsx');
    const sheet = workbook.getWorksheet('TABLA DINAMICA');
    if (!sheet) {
      console.log('Sheet "TABLA DINAMICA" not found.');
      return;
    }

    console.log('Analyzing sheet: TABLA DINAMICA');
    let count = 0;
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < 30) {
        const values = row.values.map(v => (v && typeof v === 'object' && v.result !== undefined ? v.result : v));
        console.log(`Row ${rowNumber}:`, JSON.stringify(values));
      }
    });
  } catch (err) {
    console.error('Error reading Excel:', err);
  }
}

analyzeExcel();
