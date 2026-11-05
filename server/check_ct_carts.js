const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const ctCarts = await col.find({ institucion: 'CAMILO TORRES', dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  const ctScreens = await col.find({ institucion: 'CAMILO TORRES', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const sMap = {};
  for (const s of ctScreens) sMap[`${s.sede.toUpperCase()}|||${s.aula.toUpperCase()}`] = s.convenio;

  console.log('Camilo Torres carts:');
  for (const car of ctCarts) {
    const k = `${car.sede.toUpperCase()}|||${car.aula.toUpperCase()}`;
    console.log(`Placa: ${car.placa}, Sede: ${car.sede}, Aula: ${car.aula}, Conv: ${car.convenio}, Pantalla: ${sMap[k]}`);
  }

  await c.close();
}

run().catch(console.error);
