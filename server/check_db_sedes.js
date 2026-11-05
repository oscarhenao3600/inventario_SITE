const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const res = await col.aggregate([
    { $match: { dispositivo: 'Pantalla Interactiva Táctil' } },
    { $group: { _id: { conv: '$convenio', inst: '$institucion', sede: '$sede' }, count: { $sum: 1 } } },
    { $sort: { '_id.conv': 1, '_id.inst': 1, '_id.sede': 1 } }
  ]).toArray();

  console.log('--- RECUENTO ACTUAL EN DB ---');
  for (const r of res) {
    console.log(`${r._id.conv} | ${r._id.inst} | ${r._id.sede} = ${r.count}`);
  }

  await client.close();
}

run().catch(console.error);
