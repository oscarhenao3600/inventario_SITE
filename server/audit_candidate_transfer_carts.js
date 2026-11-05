const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const allCarros = await col.find({
    convenio: { $in: ['2022-006', '2024-001'] },
    dispositivo: 'Carro Cargador de Tabletas'
  }).toArray();

  const allTe = await col.find({ dispositivo: 'Tablet Para Estudiantes' }).toArray();
  const teMap = {};
  for (const t of allTe) {
    const k = `${(t.institucion||'').trim().toUpperCase()}|||${(t.sede||'').trim().toUpperCase()}|||${(t.aula||'').trim().toUpperCase()}`;
    teMap[k] = (teMap[k] || 0) + 1;
  }

  const allScreens = await col.find({ dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const screenMap = {};
  for (const s of allScreens) {
    const k = `${(s.institucion||'').trim().toUpperCase()}|||${(s.sede||'').trim().toUpperCase()}|||${(s.aula||'').trim().toUpperCase()}`;
    if (!screenMap[k]) screenMap[k] = [];
    screenMap[k].push(s.convenio);
  }

  console.log('=== CARROS EN 2022-006 Y 2024-001 CON 0 TABLETS DE ESTUDIANTES O SIN PANTALLAS ===');
  const candidates = [];
  for (const car of allCarros) {
    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const teCount = teMap[k] || 0;
    const screens = screenMap[k] || [];

    if (teCount === 0 || screens.length === 0 || car.aula.toUpperCase().includes('RECTOR')) {
      candidates.push({
        placa: car.placa,
        serial: car.serial,
        inst: car.institucion,
        sede: car.sede,
        aula: car.aula,
        conv: car.convenio,
        teCount,
        screens: screens.join(','),
        notas: car.notas
      });
    }
  }

  console.log(`Total candidatos sin tablets o sin pantallas: ${candidates.length}`);
  console.table(candidates);

  await c.close();
}

run().catch(console.error);
