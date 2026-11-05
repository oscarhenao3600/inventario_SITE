const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const res = await col.aggregate([
    { $group: { _id: { conv: '$convenio', dev: '$dispositivo' }, count: { $sum: 1 } } },
    { $sort: { '_id.conv': 1, '_id.dev': 1 } }
  ]).toArray();

  console.log('=== RECUENTO POR CONVENIO Y TIPO DE DISPOSITIVO ===');
  for (const r of res) {
    console.log(`${(r._id.conv || 'SIN CONVENIO').padEnd(12)} | ${(r._id.dev || 'DESCONOCIDO').padEnd(30)} = ${r.count}`);
  }

  await client.close();
}

run().catch(console.error);
