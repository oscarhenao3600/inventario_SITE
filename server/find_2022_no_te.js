const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const allCarros22 = await col.find({
    dispositivo: 'Carro Cargador de Tabletas',
    convenio: '2022-006'
  }).toArray();

  const allTe = await col.find({
    dispositivo: 'Tablet Para Estudiantes'
  }).toArray();

  const teMap = {};
  for (const t of allTe) {
    const k = `${(t.institucion||'').trim().toUpperCase()}|||${(t.sede||'').trim().toUpperCase()}|||${(t.aula||'').trim().toUpperCase()}`;
    teMap[k] = (teMap[k] || 0) + 1;
  }

  const sinTe22 = [];
  for (const car of allCarros22) {
    const kExact = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const count = teMap[kExact] || 0;
    if (count === 0) {
      // Check if there are other devices in that room (e.g. pantalla, servidor, etc.)
      const otherDevs = await col.find({
        institucion: car.institucion,
        sede: car.sede,
        aula: car.aula,
        _id: { $ne: car._id }
      }).toArray();

      sinTe22.push({
        placa: car.placa,
        serial: car.serial,
        institucion: car.institucion,
        sede: car.sede,
        aula: car.aula,
        convenio: car.convenio,
        otrosDispositivosEnAula: otherDevs.map(d => `${d.dispositivo} (${d.convenio})`).join(', ')
      });
    }
  }

  console.log(`Carros en 2022-006 sin tablets de estudiantes en el aula: ${sinTe22.length}`);
  console.table(sinTe22);

  await c.close();
}

run().catch(console.error);
