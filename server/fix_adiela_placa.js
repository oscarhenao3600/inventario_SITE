const { MongoClient } = require('mongodb');

async function fixAdielaPlaca() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Placa 44581 and its associated classroom devices belong to LA CECILIA
  await col.updateMany(
    { placa: '44581' },
    { $set: { sede: 'LA CECILIA' } }
  );
  // Also any devices in that specific classroom with placa 44581:
  const p = await col.findOne({ placa: '44581' });
  if (p) {
    await col.updateMany(
      { institucion: 'LA ADIELA', aula: p.aula, convenio: '2022-006', placa: { $ne: '44585' } },
      { $set: { sede: 'LA CECILIA' } }
    );
  }

  await client.close();
}

fixAdielaPlaca().catch(console.error);
