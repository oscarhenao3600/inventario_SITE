const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const collections = await db.listCollections().toArray();
  console.log('Collections in inventario_educativo:', collections.map(c => c.name));
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`   ${c.name}: ${count} docs`);
    const sample = await db.collection(c.name).findOne();
    console.log(`   Sample ${c.name}:`, Object.keys(sample || {}));
  }
  await client.close();
}

main().catch(console.error);
