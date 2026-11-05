const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const stCarts = await col.find({ institucion: 'SANTA TERESA DE JESUS', convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  const allTe = await col.find({ institucion: 'SANTA TERESA DE JESUS', dispositivo: 'Tablet Para Estudiantes' }).toArray();
  const teMap = {};
  for (const t of allTe) {
    const k = `${t.sede.toUpperCase()}|||${t.aula.toUpperCase()}`;
    teMap[k] = (teMap[k] || 0) + 1;
  }

  console.log(`Santa Teresa 2022 carts: ${stCarts.length}`);
  for (const car of stCarts) {
    const k = `${car.sede.toUpperCase()}|||${car.aula.toUpperCase()}`;
    console.log(`Placa: ${car.placa}, Sede: ${car.sede}, Aula: ${car.aula}, TE en aula: ${teMap[k] || 0}`);
  }

  await c.close();
}

run().catch(console.error);
