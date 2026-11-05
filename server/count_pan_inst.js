const { MongoClient } = require('mongodb');

async function countPanByInst() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const agg = await col.aggregate([
      { $match: { dispositivo: 'Pantalla Interactiva Táctil' } },
      { $group: { _id: '$institucion', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    console.log('=== TOTAL PANTALLAS POR INSTITUCION EN BD ===');
    console.table(agg);
    console.log('Total general:', agg.reduce((s, a) => s + a.count, 0));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

countPanByInst();
