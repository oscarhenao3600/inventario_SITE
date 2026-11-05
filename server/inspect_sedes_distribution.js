const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  console.log('=== DISTRIBUCIÓN POR SEDE EN CADA INSTITUCIÓN (2022-006 Y 2024-001) ===');
  for (const inst of insts) {
    const sedes = await col.distinct('sede', { institucion: inst });
    const sedeRows = [];
    for (const s of sedes) {
      const p22 = await col.countDocuments({ institucion: inst, sede: s, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
      const c22 = await col.countDocuments({ institucion: inst, sede: s, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
      const p24 = await col.countDocuments({ institucion: inst, sede: s, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
      const c24 = await col.countDocuments({ institucion: inst, sede: s, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });

      if (p22 > 0 || c22 > 0 || p24 > 0 || c24 > 0) {
        sedeRows.push({
          Sede: s,
          P22: p22, C22: c22, Diff22: c22 - p22,
          P24: p24, C24: c24, Diff24: c24 - p24
        });
      }
    }
    if (sedeRows.length > 1) {
      console.log(`\n--- ${inst} ---`);
      console.table(sedeRows);
    }
  }

  await c.close();
}

run().catch(console.error);
