const ExcelJS = require('exceljs');

async function checkTargets() {
  const wb111 = new ExcelJS.Workbook();
  await wb111.xlsx.readFile('BD AULAS SITE JEFE111.xlsx');

  const sDiff = wb111.getWorksheet('Diferencias');
  console.log('=== BD AULAS SITE JEFE111.xlsx -> Diferencias ===');
  sDiff.eachRow((r, rNum) => {
    if (rNum <= 35) {
      const vals = [];
      r.eachCell({ includeEmpty: true }, (c, colNum) => {
        let v = c.value;
        if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
        vals.push(v === null || v === undefined ? '' : v);
      });
      console.log(`R${rNum}: ` + vals.join(' | '));
    }
  });

  const sTabla2 = wb111.getWorksheet('TABLA 2');
  console.log('\n=== BD AULAS SITE JEFE111.xlsx -> TABLA 2 ===');
  sTabla2.eachRow((r, rNum) => {
    if (rNum <= 35) {
      const vals = [];
      r.eachCell({ includeEmpty: true }, (c, colNum) => {
        let v = c.value;
        if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
        vals.push(v === null || v === undefined ? '' : v);
      });
      console.log(`R${rNum}: ` + vals.join(' | '));
    }
  });
}

checkTargets();
