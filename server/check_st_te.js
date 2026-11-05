const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const te = await col.aggregate([
    { $match: { institucion: 'SANTA TERESA DE JESUS', dispositivo: 'Tablet Para Estudiantes' } },
    { $group: { _id: '$convenio', count: { $sum: 1 } } }
  ]).toArray();

  console.log('Santa Teresa TE por convenio:', te);
  await c.close();
}

run().catch(console.error);
