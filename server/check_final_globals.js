const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const res = await col.aggregate([
    { $match: { dispositivo: { $in: ['Pantalla Interactiva Táctil', 'Carro Cargador de Tabletas', 'Tablet Para Estudiantes'] } } },
    { $group: { _id: { d: '$dispositivo', c: '$convenio' }, count: { $sum: 1 } } },
    { $sort: { '_id.d': 1, '_id.c': 1 } }
  ]).toArray();

  console.table(res.map(r => ({ Dispositivo: r._id.d, Convenio: r._id.c, Cantidad: r.count })));
  await c.close();
}

run().catch(console.error);
