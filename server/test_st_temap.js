const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const allTe = await col.find({ dispositivo: 'Tablet Para Estudiantes' }).toArray();
  const teMap = {};
  for (const t of allTe) {
    const k = `${(t.institucion||'').trim().toUpperCase()}|||${(t.sede||'').trim().toUpperCase()}|||${(t.aula||'').trim().toUpperCase()}`;
    teMap[k] = (teMap[k] || 0) + 1;
  }

  const stCarts = await col.find({ institucion: 'SANTA TERESA DE JESUS', convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  for (const car of stCarts) {
    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    console.log(car.placa, k, teMap[k] || 0);
  }

  await c.close();
}

run().catch(console.error);
