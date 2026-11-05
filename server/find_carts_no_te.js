const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const allCarros = await col.find({
    dispositivo: 'Carro Cargador de Tabletas',
    convenio: { $in: ['2022-006', '2024-001'] }
  }).toArray();

  const allTe = await col.find({
    dispositivo: 'Tablet Para Estudiantes'
  }).toArray();

  // Map student tablets by (institucion + sede + aula)
  const teMap = {};
  for (const t of allTe) {
    const k = `${(t.institucion||'').trim().toUpperCase()}|||${(t.sede||'').trim().toUpperCase()}|||${(t.aula||'').trim().toUpperCase()}`;
    teMap[k] = (teMap[k] || 0) + 1;
  }

  // Also check by (institucion + aula) in case sede naming differs
  const teInstAulaMap = {};
  for (const t of allTe) {
    const k = `${(t.institucion||'').trim().toUpperCase()}|||${(t.aula||'').trim().toUpperCase()}`;
    teInstAulaMap[k] = (teInstAulaMap[k] || 0) + 1;
  }

  const carrosSinTeExact = [];
  for (const car of allCarros) {
    const kExact = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const kInstAula = `${(car.institucion||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    
    const countExact = teMap[kExact] || 0;
    const countInstAula = teInstAulaMap[kInstAula] || 0;

    if (countExact === 0) {
      carrosSinTeExact.push({
        _id: car._id,
        placa: car.placa,
        serial: car.serial,
        institucion: car.institucion,
        sede: car.sede,
        aula: car.aula,
        convenio: car.convenio,
        teInSameAulaAnySede: countInstAula
      });
    }
  }

  console.log(`Carros en 2022-006 o 2024-001 sin tablets exactas en aula: ${carrosSinTeExact.length}`);
  console.table(carrosSinTeExact);

  await c.close();
}

run().catch(console.error);
