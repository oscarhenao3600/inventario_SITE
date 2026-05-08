const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const results = await db.collection('dispositivos').aggregate([
      { $match: { institucion: /NACIONAL JESUS MARIA OCAMPO/i } },
      { $group: { _id: { institucion: '$institucion', sede: '$sede' }, count: { $sum: 1 } } }
    ]).toArray();
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
