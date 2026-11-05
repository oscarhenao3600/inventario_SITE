const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const casd25 = await col.find({
    institucion: 'CASD',
    dispositivo: 'Carro Cargador de Tabletas',
    convenio: '2025-001'
  }).toArray();

  console.log(`CASD Carros 2025-001 count: ${casd25.length}`);
  const byUser = {};
  for (const d of casd25) {
    const u = d.updatedBy || '(none)';
    byUser[u] = (byUser[u] || 0) + 1;
  }
  console.log('Updated by:', byUser);
  console.log('Sample docs:', casd25.slice(0, 3).map(d => ({
    placa: d.placa,
    serial: d.serial,
    fecha: d.fecha,
    sede: d.sede,
    aula: d.aula,
    updatedAt: d.updatedAt,
    updatedBy: d.updatedBy
  })));

  // Also check other institutions with 2025-001 carts
  const c25ByInst = await col.aggregate([
    { $match: { dispositivo: 'Carro Cargador de Tabletas', convenio: '2025-001' } },
    { $group: { _id: '$institucion', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log('\nCarros 2025-001 por institución:');
  console.table(c25ByInst);

  // And screens in 2025-001 by institution
  const p25ByInst = await col.aggregate([
    { $match: { dispositivo: 'Pantalla Interactiva Táctil', convenio: '2025-001' } },
    { $group: { _id: '$institucion', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log('\nPantallas 2025-001 por institución:');
  console.table(p25ByInst);

  await c.close();
}

run().catch(console.error);
