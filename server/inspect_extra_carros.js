const { MongoClient } = require('mongodb');

async function inspectExtraCarrosAndDocentes() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Let's find classrooms with > 1 cart in 2022-006
  const c2022 = await col.aggregate([
    { $match: { convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' } },
    { $group: { _id: { inst: '$institucion', sede: '$sede', aula: '$aula' }, count: { $sum: 1 }, placas: { $push: '$placa' } } },
    { $match: { count: { $gt: 1 } } }
  ]).toArray();
  console.log("Aulas con más de 1 carro en 2022-006:", c2022);

  // Or carts in non-classroom locations (e.g. Rectoria, Coordinacion, Bodega, etc.)
  const cNonAula = await col.find({
    convenio: '2022-006',
    dispositivo: 'Carro Cargador de Tabletas',
    aula: { $regex: /rector|coord|bodeg|pasill|bibliot|sala.*prof/i }
  }).toArray();
  console.log("Carros en ubicaciones administrativas en 2022-006:", cNonAula.map(c => ({ inst: c.institucion, sede: c.sede, aula: c.aula, placa: c.placa })));

  // Same for docente tablets in 2024-001:
  const td2024 = await col.aggregate([
    { $match: { convenio: '2024-001', dispositivo: 'Tablet Para Docentes' } },
    { $group: { _id: { inst: '$institucion', sede: '$sede', aula: '$aula' }, count: { $sum: 1 }, placas: { $push: '$placa' } } },
    { $match: { count: { $gt: 1 } } }
  ]).toArray();
  console.log("Aulas con más de 1 docente tablet en 2024-001:", td2024);

  const tdNonAula = await col.find({
    convenio: '2024-001',
    dispositivo: 'Tablet Para Docentes',
    aula: { $regex: /rector|coord|bodeg|pasill|bibliot|sala.*prof/i }
  }).toArray();
  console.log("Docente tablets en ubicaciones administrativas en 2024-001:", tdNonAula.map(c => ({ inst: c.institucion, sede: c.sede, aula: c.aula, placa: c.placa })));

  await client.close();
}

inspectExtraCarrosAndDocentes().catch(console.error);
