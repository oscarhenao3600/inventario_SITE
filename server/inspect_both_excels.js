const ExcelJS = require('exceljs');

async function inspectWorkbooks() {
  for (const filename of ['BD AULAS SITE JEFE.xlsx', 'BD AULAS SITE JEFE111.xlsx']) {
    console.log(`\n=================== FILE: ${filename} ===================`);
    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(filename);
      console.log('Worksheets:', wb.worksheets.map(w => w.name));
      for (const ws of wb.worksheets) {
        console.log(`Sheet "${ws.name}": rows=${ws.rowCount}, cols=${ws.columnCount}`);
      }
    } catch (e) {
      console.error(`Error reading ${filename}:`, e.message);
    }
  }
}

inspectWorkbooks();
