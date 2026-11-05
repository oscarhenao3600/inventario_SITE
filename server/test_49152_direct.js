const { MongoClient } = require('mongodb');

async function test49152() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const collections = await db.listCollections().toArray();
  console.log('Collections on 49152:', collections.map(c => c.name));
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`  ${c.name}: ${count} docs`);
  }

  // Count by convenio
  const convs = await db.collection('dispositivos').aggregate([
    { $group: { _id: '$convenio', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Convenios on 49152:', convs);

  await client.close();
}

test49152().catch(console.error);
