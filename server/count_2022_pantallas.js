const { MongoClient } = require('mongodb');

async function count2022PantallasByInst() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const agg = await col.aggregate([
      { $match: { convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' } },
      { $group: { _id: '$institucion', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    console.log('=== 2022-006 PANTALLAS POR INSTITUCION ===');
    console.table(agg);
    const total = agg.reduce((s, a) => s + a.count, 0);
    console.log(`Total: ${total}`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

count2022PantallasByInst();
