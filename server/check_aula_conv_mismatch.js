const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  // Find all classrooms that have BOTH a Pantalla and a Carro
  const allPantallas = await col.find({ dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const allCarros = await col.find({ dispositivo: 'Carro Cargador de Tabletas' }).toArray();

  const panMap = {};
  for (const p of allPantallas) {
    const k = `${(p.institucion||'').trim().toUpperCase()}|||${(p.sede||'').trim().toUpperCase()}|||${(p.aula||'').trim().toUpperCase()}`;
    panMap[k] = p;
  }

  const carMap = {};
  for (const car of allCarros) {
    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    if (!carMap[k]) carMap[k] = [];
    carMap[k].push(car);
  }

  let matchedConvenios = 0;
  let mismatchedConvenios = 0;
  const mismatches = [];

  for (const [k, carList] of Object.entries(carMap)) {
    const pan = panMap[k];
    if (pan) {
      for (const car of carList) {
        if (car.convenio === pan.convenio) {
          matchedConvenios++;
        } else {
          mismatchedConvenios++;
          mismatches.push({
            institucion: car.institucion,
            sede: car.sede,
            aula: car.aula,
            carPlaca: car.placa,
            carConvenio: car.convenio,
            panPlaca: pan.placa,
            panConvenio: pan.convenio
          });
        }
      }
    }
  }

  console.log(`Carros que coinciden en aula con Pantalla:`);
  console.log(`  Mismo convenio: ${matchedConvenios}`);
  console.log(`  Distinto convenio: ${mismatchedConvenios}`);

  console.log('\nPrimeros 25 desajustes de convenio en la misma aula:');
  console.table(mismatches.slice(0, 25));

  // Count mismatches between 2022-006 and 2024-001 specifically
  const c22To24 = mismatches.filter(m => m.carConvenio === '2022-006' && m.panConvenio === '2024-001');
  const c24To22 = mismatches.filter(m => m.carConvenio === '2024-001' && m.panConvenio === '2022-006');
  console.log(`Carro 2022-006 pero Pantalla 2024-001: ${c22To24.length}`);
  console.log(`Carro 2024-001 pero Pantalla 2022-006: ${c24To22.length}`);

  await c.close();
}

run().catch(console.error);
