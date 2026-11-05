const ExcelJS = require('exceljs');

async function checkHoja1() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE111.xlsx');
  const ws = wb.getWorksheet('Hoja1');

  const counts2022 = {};
  const counts2024 = {};
  const counts2025 = {};

  ws.eachRow((r, i) => {
    if (i === 1) return;
    const inst = (r.getCell(3).value || '').toString().trim();
    const conv = (r.getCell(9).value || '').toString().trim();

    if (conv === '2022-006') counts2022[inst] = (counts2022[inst] || 0) + 1;
    if (conv === '2024-001') counts2024[inst] = (counts2024[inst] || 0) + 1;
    if (conv === '2025-001') counts2025[inst] = (counts2025[inst] || 0) + 1;
  });

  console.log('=== HOJA1: 2022-006 count by institution ===');
  console.table(counts2022);
  console.log('Total 2022 in Hoja1:', Object.values(counts2022).reduce((a, b) => a + b, 0));

  console.log('=== HOJA1: 2024-001 count by institution ===');
  console.table(counts2024);
  console.log('Total 2024 in Hoja1:', Object.values(counts2024).reduce((a, b) => a + b, 0));

  console.log('=== HOJA1: 2025-001 count by institution ===');
  console.table(counts2025);
  console.log('Total 2025 in Hoja1:', Object.values(counts2025).reduce((a, b) => a + b, 0));
}

checkHoja1();
