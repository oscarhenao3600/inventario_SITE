const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');

  // Check collections
  const collections = await db.listCollections().toArray();
  console.log('Colecciones en inventario_educativo:', collections.map(c => c.name));

  // Check if any collection has history or logs
  for (const c of collections) {
    if (c.name !== 'dispositivos') {
      const count = await db.collection(c.name).countDocuments();
      console.log(`Colección ${c.name}: ${count} documentos`);
    }
  }

  // Check one doc from NJMO with "cambio de sede"
  const doc = await db.collection('dispositivos').findOne({
    institucion: /OCAMPO/i,
    notas: /sede/i
  });
  console.log('Ejemplo doc NJMO con cambio de sede:', doc);

  await client.close();
}

main();
