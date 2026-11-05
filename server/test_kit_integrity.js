const { MongoClient } = require('mongodb');

async function testClassroomKitIntegrity() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Let's inspect Ciudad Milagro classrooms and equipment
  console.log('=== EQUIPOS EN CIUDAD MILAGRO ===');
  const cm = await col.aggregate([
    { $match: { institucion: 'CAMARA JUNIOR', sede: 'CIUDAD MILAGRO' } },
    { $group: { _id: { aula: '$aula', dev: '$dispositivo' }, count: { $sum: 1 } } },
    { $sort: { '_id.aula': 1, '_id.dev': 1 } }
  ]).toArray();

  const byAula = {};
  for (const r of cm) {
    byAula[r._id.aula] = byAula[r._id.aula] || {};
    byAula[r._id.aula][r._id.dev] = r.count;
  }
  for (const [aula, devs] of Object.entries(byAula)) {
    console.log(aula.padEnd(20), JSON.stringify(devs));
  }

  await client.close();
}

testClassroomKitIntegrity().catch(console.error);
