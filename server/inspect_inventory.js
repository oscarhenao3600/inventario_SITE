const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const collection = db.collection('dispositivos');

    console.log('--- CONTEO POR DISPOSITIVO ---');
    const byDevice = await collection.aggregate([
      { $group: { _id: '$dispositivo', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    console.log(JSON.stringify(byDevice, null, 2));

    console.log('--- CONTEO POR CONVENIO ---');
    const byConv = await collection.aggregate([
      { $group: { _id: '$convenio', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    console.log(JSON.stringify(byConv, null, 2));

    console.log('--- CONTEO POR CONVENIO Y DISPOSITIVO ---');
    const byConvDev = await collection.aggregate([
      { $group: { _id: { convenio: '$convenio', dispositivo: '$dispositivo' }, count: { $sum: 1 } } },
      { $sort: { '_id.convenio': 1, '_id.dispositivo': 1 } }
    ]).toArray();
    console.log(JSON.stringify(byConvDev, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
