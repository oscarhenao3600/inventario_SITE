const { MongoClient } = require('mongodb');

async function fixAdiela() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  await col.updateMany(
    { institucion: 'LA ADIELA', aula: 'AULA 2', convenio: '2022-006' },
    { $set: { sede: 'LA ADIELA' } }
  );

  await client.close();
}

fixAdiela().catch(console.error);
