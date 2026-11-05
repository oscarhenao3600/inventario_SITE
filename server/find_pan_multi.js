const { MongoClient } = require('mongodb');

async function findPanMulti() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const multi = await col.aggregate([
      { $match: { dispositivo: 'Pantalla Interactiva Táctil' } },
      { $group: { _id: { inst: '$institucion', sede: '$sede', aula: '$aula', conv: '$convenio' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    console.log('Multiple pantallas in same aula and convenio:', multi);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

findPanMulti();
