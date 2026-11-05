const ExcelJS = require('exceljs');

async function inspect111Convenios() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE111.xlsx');
  
  for (const sheetName of ['INVENTARIO', 'info_tic', 'Hoja1']) {
    const ws = wb.getWorksheet(sheetName);
    console.log(`\n--- Sheet ${sheetName} ---`);
    const headerRow = ws.getRow(1);
    const headers = [];
    headerRow.eachCell((c, i) => headers.push(`[${i}] ${c.value}`));
    console.log('Headers:', headers.join(', '));

    const convIndex = headers.findIndex(h => /convenio/i.test(h)) + 1;
    console.log('Convenio col index:', convIndex);
    if (convIndex > 0) {
      const convs = {};
      ws.eachRow((r, rNum) => {
        if (rNum === 1) return;
        const v = (r.getCell(convIndex).value || '').toString().trim();
        convs[v] = (convs[v] || 0) + 1;
      });
      console.log('Convenios:', convs);
    }
  }
}

inspect111Convenios();
