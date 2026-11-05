const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const allCarros = await col.find({ convenio: { $in: ['2022-006', '2024-001'] }, dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  const allScreens = await col.find({ convenio: { $in: ['2022-006', '2024-001'] }, dispositivo: 'Pantalla Interactiva Táctil' }).toArray();

  const screenMap = {};
  for (const s of allScreens) {
    screenMap[`${(s.institucion||'').trim().toUpperCase()}|||${(s.sede||'').trim().toUpperCase()}|||${(s.aula||'').trim().toUpperCase()}`] = s;
  }

  const grp = {};
  for (const car of allCarros) {
    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const s = screenMap[k];
    if (s && s.convenio !== car.convenio) {
      if (!grp[car.institucion]) grp[car.institucion] = { '22->24': 0, '24->22': 0 };
      if (car.convenio === '2022-006' && s.convenio === '2024-001') grp[car.institucion]['22->24']++;
      if (car.convenio === '2024-001' && s.convenio === '2022-006') grp[car.institucion]['24->22']++;
    }
  }

  console.table(grp);
  await c.close();
}

run().catch(console.error);
