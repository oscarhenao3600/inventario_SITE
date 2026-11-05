const ExcelJS = require('exceljs');
const { MongoClient } = require('mongodb');

async function analyzeAll() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('BD AULAS SITE JEFE.xlsx');
  
  // Sheet Diferencias
  const diffSheet = wb.getWorksheet('Diferencias');
  console.log('--- EXCEL: Diferencias Sheet Rows ---');
  diffSheet.eachRow((row, rNum) => {
    const vals = [];
    for (let c = 1; c <= 7; c++) {
      vals.push(row.getCell(c).value);
    }
    // Only print if there is some difference or row <= 5
    if (rNum <= 5 || vals.slice(1).some(v => v !== null && v !== '')) {
      console.log(`Row ${rNum}:`, JSON.stringify(vals));
    }
  });

  // Check MongoDB at institution level
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('\n--- MONGODB: Total devices by institution ---');
  const instCounts = await col.aggregate([
    {
      $group: {
        _id: { institucion: '$institucion', convenio: '$convenio' },
        pantallas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
        servidores: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
        soportes: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
        carros: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
        tabletsDoc: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
        tabletsEst: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } }
      }
    },
    { $sort: { '_id.institucion': 1, '_id.convenio': 1 } }
  ]).toArray();

  console.log(`Found ${instCounts.length} institution/convenio combinations in DB.`);
  console.log('Sample of 10:');
  console.log(JSON.stringify(instCounts.slice(0, 10), null, 2));

  await client.close();
}

analyzeAll().catch(console.error);
