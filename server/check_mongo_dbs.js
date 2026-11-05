const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  
  // List all databases
  const adminDb = client.db().admin();
  const dbs = await adminDb.listDatabases();
  console.log('Databases:', dbs);

  for (const d of dbs.databases) {
    const currentDb = client.db(d.name);
    const collections = await currentDb.listCollections().toArray();
    console.log(`DB: ${d.name} -> Collections:`, collections.map(c => c.name));
    for (const c of collections) {
      const count = await currentDb.collection(c.name).countDocuments();
      console.log(`   ${c.name}: ${count} docs`);
    }
  }

  await client.close();
}

main().catch(console.error);
