const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const csCarts = await col.find({ institucion: 'CIUDADELA DEL SUR', convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  const allScreens = await col.find({ institucion: 'CIUDADELA DEL SUR', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const screenMap = {};
  for (const s of allScreens) screenMap[`${s.sede.toUpperCase()}|||${s.aula.toUpperCase()}`] = s.convenio;

  const allTe = await col.find({ institucion: 'CIUDADELA DEL SUR', dispositivo: 'Tablet Para Estudiantes' }).toArray();
  const teMap = {};
  for (const t of allTe) {
    const k = `${t.sede.toUpperCase()}|||${t.aula.toUpperCase()}`;
    teMap[k] = (teMap[k] || 0) + 1;
  }

  console.log(`Ciudadela del Sur 2022 carts: ${csCarts.length}`);
  for (const car of csCarts) {
    const k = `${car.sede.toUpperCase()}|||${car.aula.toUpperCase()}`;
    console.log(`Placa: ${car.placa}, Sede: ${car.sede}, Aula: ${car.aula}, Pantalla: ${screenMap[k] || '(ninguna)'}, TE: ${teMap[k] || 0}`);
  }

  await c.close();
}

run().catch(console.error);
