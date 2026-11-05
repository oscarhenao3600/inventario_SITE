const { MongoClient } = require('mongodb');

async function fullAudit() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('=== AUDITORÍA COMPLETA DE DISPOSITIVOS EN MONGODB ===');

  // Total por dispositivo y convenio
  const devSummary = await col.aggregate([
    { $group: { _id: { conv: '$convenio', dev: '$dispositivo' }, count: { $sum: 1 } } },
    { $sort: { '_id.conv': 1, '_id.dev': 1 } }
  ]).toArray();

  for (const r of devSummary) {
    console.log(`${(r._id.conv || 'SIN CONVENIO').padEnd(12)} | ${(r._id.dev || 'SIN DISPOSITIVO').padEnd(45)} = ${r.count}`);
  }

  // Ver todas las pantallas con sus seriales y convenios
  const allScreens = await col.find({ dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log(`\nTotal Pantallas en BD: ${allScreens.length}`);

  const serialPatterns = {
    '2022 (IS...)': allScreens.filter(s => s.serial && s.serial.startsWith('IS')).length,
    '2024 (JYD2023...)': allScreens.filter(s => s.serial && s.serial.startsWith('JYD2023')).length,
    '2025 (JYD2024...)': allScreens.filter(s => s.serial && s.serial.startsWith('JYD2024')).length,
    'HYZY...': allScreens.filter(s => s.serial && s.serial.startsWith('HYZY')).length,
    'Sin serial': allScreens.filter(s => !s.serial || s.serial.trim() === '').length,
    'Otros': allScreens.filter(s => s.serial && !s.serial.startsWith('IS') && !s.serial.startsWith('JYD') && !s.serial.startsWith('HYZY')).length
  };
  console.log('Patrones de serial en pantallas:');
  console.log(serialPatterns);

  await client.close();
}

fullAudit().catch(console.error);
